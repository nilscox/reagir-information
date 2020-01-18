import {
  Controller,
  Get, Post, Put,
  Param, Body,
  ParseIntPipe,
  UseInterceptors, UseGuards,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { IsAuthenticated } from 'Common/auth.guard';
import { IsAuthor, IsNotAuthor } from 'Common/is-author.guard';
import { AuthUser } from 'Common/auth-user.decorator';
import { OptionalQuery } from 'Common/optional-query.decorator';
import { Output, PaginatedOutput } from 'Common/output.interceptor';
import { PopulateReaction } from './populate-reaction.interceptor';

import { User } from '../user/user.entity';
import { Reaction } from './reaction.entity';
import { Subject } from '../subject/subject.entity';

import { ReactionService } from './reaction.service';
import { ReactionRepository } from './reaction.repository';
import { SubjectService } from '../subject/subject.service';
import { ReportService } from '../report/report.service';

import { CreateReactionInDto } from './dtos/create-reaction-in.dto';
import { UpdateReactionInDto } from './dtos/update-reaction-in.dto';
import { ReactionOutDto, ReactionWithInformationOutDto } from './dtos/reaction-out.dto';
import { ReactionWithHistoryOutDto } from './dtos/reaction-with-history-out.dto';
import { QuickReactionInDto } from './dtos/quick-reaction-in.dto';
import { ReportInDto } from '../report/dtos/report-in.dto';
import { Paginated } from 'Common/paginated';
import { SortType } from 'Common/sort-type';
import { InformationService } from '../information/information.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { OptionalParseIntPipe } from 'Common/optional-parse-int.pipe';
import { PageQuery } from 'Common/page-query.decorator';
import { SearchQuery } from 'Common/search-query.decorator';

@Controller('/reaction')
export class ReactionController {

  @Inject('REACTION_PAGE_SIZE')
  private readonly reactionPageSize: number;

  constructor(
    private readonly informationService: InformationService,
    private readonly subjectService: SubjectService,
    private readonly reactionService: ReactionService,
    private readonly subscriptionService: SubscriptionService,
    private readonly reportService: ReportService,
    private readonly reactionRepository: ReactionRepository,
  ) {}

  @Get('me')
  @UseGuards(IsAuthenticated)
  @UseInterceptors(PopulateReaction)
  @PaginatedOutput(ReactionWithInformationOutDto)
  async findForUser(
    @AuthUser() user: User,
    @OptionalQuery({ key: 'informationId' }, OptionalParseIntPipe) informationId: number | undefined,
    @SearchQuery() search: string,
    @PageQuery() page: number,
  ): Promise<Paginated<Reaction>> {
    return this.reactionRepository.findForUser(user.id, informationId, search, SortType.DATE_DESC, page, this.reactionPageSize);
  }

  @Get(':id')
  @UseInterceptors(PopulateReaction)
  @Output(ReactionWithHistoryOutDto)
  async findOneById(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Reaction> {
    return this.reactionService.findById(id);
  }

  @Get(':id/replies')
  @UseInterceptors(PopulateReaction)
  @PaginatedOutput(ReactionOutDto)
  async findReplies(
    @Param('id', new ParseIntPipe()) id: number,
    @PageQuery() page: number,
  ): Promise<Paginated<Reaction>> {
    if (!(await this.reactionRepository.exists(id)))
      throw new NotFoundException();

    return this.reactionRepository.findReplies(id, page, this.reactionPageSize);
  }

  @Post(':id/subscribe')
  @UseGuards(IsAuthenticated)
  async subscribe(
    @AuthUser() user: User,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<void> {
    const reaction = await this.reactionService.findById(id);

    if (!reaction)
      throw new NotFoundException();

    const subscription = await this.subscriptionService.getSubscription(user, reaction);

    if (subscription)
      throw new ConflictException('already subscribed to reaction ' + reaction.id);

    await this.subscriptionService.subscribe(user, reaction);
  }

  @Post(':id/unsubscribe')
  @UseGuards(IsAuthenticated)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribe(
    @AuthUser() user: User,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<void> {
    const reaction = await this.reactionService.findById(id);

    if (!reaction)
      throw new NotFoundException();

    const subscription = await this.subscriptionService.getSubscription(user, reaction);

    if (!subscription)
      throw new NotFoundException();

    await this.subscriptionService.unsubscribe(subscription);
  }

  @Post()
  @UseGuards(IsAuthenticated)
  @UseInterceptors(PopulateReaction)
  @Output(ReactionOutDto)
  async create(
    @AuthUser() user: User,
    @Body() dto: CreateReactionInDto,
  ): Promise<Reaction> {
    const information = await this.informationService.findById(dto.informationId);

    if (!information)
      throw new BadRequestException(`information with id ${dto.informationId} does not exists`);

    let subject: Subject = null;

    if (dto.subjectId !== undefined) {
      subject = await this.subjectService.findById(dto.subjectId);

      if (!subject)
        throw new BadRequestException(`subject with id ${dto.subjectId} does not exist`);

      if (subject.information.id !== information.id)
        throw new BadRequestException(`subject with id ${dto.subjectId} does not belong to the information with id ${dto.informationId}`);
    }

    return this.reactionService.create(dto, user, information, subject);
  }

  @Put(':id')
  @UseGuards(IsAuthenticated, IsAuthor)
  @UseInterceptors(PopulateReaction)
  @Output(ReactionWithHistoryOutDto)
  async update(
    @Body() dto: UpdateReactionInDto,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Reaction> {
    const reaction = await this.reactionService.findById(id);

    if (!reaction)
      throw new NotFoundException();

    return this.reactionService.update(reaction, dto);
  }

  @Post(':id/quick-reaction')
  @UseGuards(IsAuthenticated, IsNotAuthor)
  @UseInterceptors(PopulateReaction)
  @Output(ReactionOutDto)
  async quickReaction(
    @AuthUser() user: User,
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: QuickReactionInDto,
  ): Promise<Reaction> {
    const reaction = await this.reactionService.findById(id);

    if (!reaction)
      throw new NotFoundException();

    await this.reactionService.setQuickReaction(reaction, user, dto.type);

    return this.reactionService.findById(reaction.id);
  }

  @Post(':id/report')
  @UseGuards(IsAuthenticated, IsNotAuthor)
  @UseInterceptors(PopulateReaction)
  @Output(ReactionOutDto)
  async report(
    @AuthUser() user: User,
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: ReportInDto,
  ): Promise<Reaction> {
    const reaction = await this.reactionService.findById(id);

    if (!reaction)
      throw new NotFoundException();

    const report = await this.reportService.didUserReportReaction(reaction, user);

    if (report)
      throw new BadRequestException('REACTION_ALREADY_REPORTED');

    await this.reportService.report(reaction, user, dto.type, dto.message);

    return reaction;
  }

}

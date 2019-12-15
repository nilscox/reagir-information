import React, { useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { Paginated, paginatedResults } from 'src/utils/parse-paginated';
import useAxios from 'src/hooks/use-axios';
import useUpdateEffect from 'src/hooks/use-update-effect';
import { parseInformation, Information } from 'src/types/Information';
import Flex from 'src/components/common/Flex';
import Box from 'src/components/common/Box';

import Pagination from '../components/Pagination';
import SearchField from '../components/SearchField';
import Loader from '../components/Loader';

const useInformations = (search: string, page: number) => {
  const [result, refetch] = useAxios<Paginated<Information>>('/api/information', paginatedResults(parseInformation));

  useUpdateEffect(() => {
    const opts: any = { params: {} };

    if (search)
      opts.params.search = search;

    if (page !== 1)
      opts.params.page = page;

    refetch(opts);
  }, [search, page]);

  return result;
};

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: 'inherit',
  },
  image: {
    width: 240,
    height: 160,
  },
  informationTitle: {
    color: theme.palette.secondary.dark,
    fontSize: 24,
    fontWeight: 'bold',
  },
  publicationDate: {
    color: '#666',
  },
}));

const InformationList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { loading, data } = useInformations(search, page);
  const classes = useStyles({});

  const renderInformation = (information: Information) => (
    <Link key={information.id} className={classes.link} to={`/information/${information.id}`}>
      <Flex flexDirection="row" my={12}>

        <img src={information.image || ''} className={classes.image} />

        <Flex flexDirection="column" p={12} >
          <div className={classes.informationTitle}>
            { information.title }
          </div>
          <Box my={6} className={classes.publicationDate}>{ moment().format('[Publiée le] DD.MM.YYYY') }</Box>
          <div>2 sujets</div>
          <div>13 réactions</div>
        </Flex>

      </Flex>
    </Link>
  );

  if (loading)
    return <Loader />;

  return (
    <>
      <SearchField onSearch={setSearch} />
      <Pagination page={page} total={data ? data.total : undefined} pageSize={10} onPageChange={setPage} />
      { data && data.items.map(renderInformation) }
    </>
  );
};

export default InformationList;

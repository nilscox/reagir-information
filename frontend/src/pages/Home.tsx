/* eslint-disable react/no-unescaped-entities, max-lines */

import React from 'react';
import { Link } from 'react-router-dom';

import Flex from 'src/components/common/Flex';
import Box from 'src/components/common/Box';
import Text from 'src/components/common/Text';

import Title from './components/Title';
import Outline from './components/Outline';
import Card from './components/Card';
import DownloadExtension from './components/DownloadExtensionButton';
import EmailValidatedAlert from './components/EmailValidatedAlert';
import Break from 'src/components/common/Break';
import Image from './components/Image';
import useResponsive from './hooks/useResponsive';

/*

Chercheurs de Vérité
Décryptons l'information !

En 10 mots:
  - CDV est un espace de discussions collaboratives en réaction à l'information
  - CDV est un espace d'échange collaboratif en réaction à l'information

Pourquoi ?
  - Rassembler une communauté de personnes pour réfléchir ensemble à ce que disent les médias
  - Lutter contre les fausses informations
  - Offrir une place aux débats dans un climat de confiance sur la toile

Comment ?
  - Des zones de commentaires liées à cdv intégrées sur les sites d'information
  - Un tri des commentaires par pertinence
  - Un cadre saint et rigoureux dans les échanges, instauré par une charte
  - Des messages correctement formatés pour maximiser la clarté des propos
  - Une modération des débats faite par des volontaires de la communauté

Qu'est-ce que c'est ?
  - Une communauté
  - Une extension pour les navigateurs
  - Un contrat d'utilisation (la charte)
  - Un algorithme de référencement
  - Une hiérarchie des réactions
  - Un support markdown
  - Une charte pour la modération

*/

/* eslint-disable max-len */

const cards = [
  {
    text: 'Rassembler une communauté de personnes pour réfléchir ensemble',
    subtext: 'Parce que les informations telles que présentes dans les médias valent la peine d\'être discutées, pour être correctement interprétées',
    image: '/assets/images/community.png',
  },
  {
    text: 'Lutter contre les fausses informations',
    subtext: 'Parce que malgré toute notre bonne volonté, on peut toujours se faire avoir par des biais, et croire pour de mauvaises raisons',
    image: '/assets/images/fake-news.png',
  },
  {
    text: 'Offrir une place aux débats dans un climat de confiance sur la toile',
    subtext: 'Parce qu\'il est souvent difficile de communiquer dans un cadre collaboratif et respectueux à travers un écran',
    image: '/assets/images/trust.png',
  },
];

const sentences = [
  {
    text: 'Des zones de commentaires intégrées directement sur les sites d\'information, via une extension chrome',
    subtext: 'Pour savoir ce qu\'en pense la communauté, tout de suite après avoir lu un article sur le site d\'un journal, ou une vidéo sur YouTube !',
  },
  {
    text: 'Des messages mis en avant, jugés les plus pertinents par la communauté',
    subtext: 'Pour voir les réactions les mieux construites, qui apportent des éléments clés, ou bien les plus controversées.',
  },
  {
    text: 'Un cadre sain et rigoureux, propice aux échanges',
    subtext: 'Pour participer aux échanges, il faut accepter une charte posant les bases nécessaires à un débat constructif.',
  },
  {
    text: 'Des messages mis en page de façon structurée',
    subtext: 'Pour permettre une plus grande clarté, les réactions peuvent comporter des liens, des listes, des tableaux, des titres, ...',
  },
  {
    text: 'Une modération des débats assurée par des membres de la communauté',
    subtext: 'Pour garder des échanges clairs et éviter les dérives, il faut parfois faire la police. On aimerait bien éviter, mais est-ce possible ?',
  },
];

/* eslint-enable max-len */

const Sentence: React.FC<{ text: React.ReactNode; subtext: React.ReactNode }> = ({ text, subtext }) => (
  <Box ml={30}>
    <div><h3><Text bold style={{ color: '#444' }}>{ text }</Text></h3></div>
    <div><p><Text style={{ fontSize: 16 }}>{ subtext }</Text></p></div>
  </Box>
);

const Pitch: React.FC = () => (
  <Outline>
    <p>
      <Link to="/">
        <em>Chercheurs de vérité</em>
      </Link>
      , c'est une plateforme qui donne accès à un <strong>espace d'échange collaboratif</strong>,
      pour réagir à l'information diffusée par les médias.
    </p>
    <p>
      Une <Link to="/utilisation">extension chrome</Link> permet d'ajouter sur certain sites
      internet, une zone de commentaire où les membres de la communauté partagent leurs opinions,
      apportent des sources, relèvent des biais, ou encore posent des questions...
    </p>
  </Outline>
);

const WhyCards: React.FC = () => (
  <Flex flexDirection="row" justifyContent="space-around" style={{ flexWrap: 'wrap' }}>
    { cards.map((props, n) => (
      <Card key={n} {...props} />
    )) }
  </Flex>
);

const What: React.FC = () => {
  const { choose } = useResponsive(1200);

  return (
    <>
      <Box mt={40} mb={20}>
        <Title id="Que propose CDV">Que propose CDV ?</Title>
      </Box>

      <Flex flexDirection={choose({ desktop: 'row', mobile: 'column' })}>
        <div style={{ flex: 1, marginBottom: choose({ desktop: undefined, mobile: 15 }) }}>
          <Image
            maximize
            src="/assets/images/youtube-cdv.gif"
            alt="screenshot youtube cdv"
            style={{ width: '100%' }}
          />
        </div>

        <Flex flex={1} flexDirection="column" justifyContent="space-between">
          {sentences.map((props, n) => (
            <Sentence key={n} {...props} />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

const Home: React.FC = () => (
  <>
    <EmailValidatedAlert />

    <Pitch />

    <WhyCards />

    <Box mt={40} mb={20}>
      <Title id="L information sur internet">L'information sur internet</Title>
    </Box>

    <p style={{ fontSize: 18 }}>
      <Text>
        Depuis quelques dizaines d'années, les évolutions technologiques ont enclenchées une vrai{' '}
        <a href="https://fr.wikipedia.org/wiki/R%C3%A9volution_num%C3%A9rique">révolution</a>, qui a
        radicalement bouleversé note façon de communiquer <em>et de nous informer</em>. En
        contrepartie, un nombre croissant de problématiques liées à l'information émergent,
        notamment dans la diffusion de celle-ci par les médias. Les articles relatant des faits hors
        du commun étant plus attrayants, les contenus sont parfois plus sensationnaliste que vrai.
      </Text>
    </p>

    <p style={{ fontSize: 18 }}>
      <Text>
        Mais avons-nous <strong>les bons outils</strong> pour réfléchir ensembles, intelligemment,
        face à cette abondance d'information sur internet ? CDV a pour ambition d'apporter des
        solutions à ces problématiques, en proposant une plateforme qui <em>vous</em> permet de
        réagir librement aux médias sur internet, comme des articles de presse ou des vidéos sur
        YouTube.
      </Text>
    </p>

    <DownloadExtension>Installer l'extension chrome</DownloadExtension>

    <What />

    <Break size="big" />
    <Break size="big" />
    <Break size="big" />

    <p style={{ fontSize: 18 }}>
      <Text>
        Si vous voulez comprendre l'information et participer à des échanges constructifs sur
        internet, alors rejoignez-nous ! Nous faisons tout pour construire une communauté
        bienveillante, attentive aux biais, qui sait écouter et partager ses opinions en apportant
        des arguments solides selon son sens critique et une méthode rigoureuse.
      </Text>
    </p>

    <p style={{ fontSize: 18 }}>
      <Text>
        Mais il est certes difficile de constituer une telle communauté. Un point central du projet
        repose sur <Link to="/charte">la charte</Link>, qui tente d'apporter un cadre propice aux
        débats. Consacrez une dizaine de minutes à sa lecture, avant de vous inscrire. Et si vous
        souhaitez apporter une évolution des règles, n'hésitez pas à{' '}
        <Link to="/faq#contact">envoyer un message</Link> à l'équipe qui développe le projet.
      </Text>
    </p>

    <p style={{ fontSize: 18 }}>
      <Text>
        Vous voulez en savoir plus ? La page <Link to="/motivations">motivation</Link> explique plus
        en détail les raisons pour lesquelles CDV a vu le jour, et l'état d'esprit du projet. Et
        pour commencer à utiliser l'extension dès maintenant, rendez-vous sur la page{' '}
        <Link to="/utilisation">utilisation</Link>. A bientôt sur internet !
      </Text>
    </p>

    <Break size="big" />
    <Break size="big" />
  </>
);

export default Home;

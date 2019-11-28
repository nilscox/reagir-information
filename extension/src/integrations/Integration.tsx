import React from 'react';
import { HashRouter as Router, Route, Redirect, useLocation, NavLink } from 'react-router-dom';

import { Information } from 'src/types/Information';
import { useTheme } from 'src/utils/Theme';

import SubjectsListPage from './pages/SubjectsListPage';
import SubjectPage from './pages/SubjectPage';
import StandaloneReactionsPage from './pages/StandaloneReactionsPage';

const Header: React.FC = () => {
  const { fontSizes, colors, sizes } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>

      <img
        src="/assets/images/logo.png"
        alt="Logo de Réagir à l'information"
        style={{ width: 36, height: 36, opacity: 0.8, marginRight: sizes.big }}
      />

      <div>
        <h1 style={{ fontFamily: 'Domine', fontSize: fontSizes.title }}>Réagir à l'information</h1>
        <div style={{ color: colors.textLight, fontSize: fontSizes.small, letterSpacing: 4 }}>
          Décryptons les médias !
        </div>
      </div>

    </div>
  );
};

const useActiveRoute = () => {
  const location = useLocation();

  return (path: string) => location.pathname.startsWith(path);
};

const Navigation: React.FC = () => {
  const { colors, fontSizes, sizes } = useTheme();
  const active = useActiveRoute();

  const tabStyle: React.CSSProperties = {
    width: 120,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: fontSizes.small,
    color: colors.textLight,
    cursor: 'pointer',
  };

  const activeStyle: React.CSSProperties = {
    borderBottom: `3px solid ${colors.border}`,
    paddingBottom: 0,
    color: colors.text,
  };

  const pages = {
    '/reaction': 'Réactions',
    '/subject': 'Sujets',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginTop: sizes.big, borderBottom:
        `1px solid ${colors.borderLight}`,
      }}
    >
      { Object.keys(pages).map((path: keyof typeof pages) => (
        <NavLink to={path} key={path} style={{ ...tabStyle, ...(active(path) && activeStyle) }}>
          { pages[path] }
        </NavLink>
      )) }
    </div>
  );
};

type IntegrationProps = {
  information: Information;
};

const Integration: React.FC<IntegrationProps> = ({ information }) => {
  const { colors: { border } } = useTheme();

  if (!information) {
    return (
      <div style={{ minHeight: 300, backgroundColor: 'white', padding: 10, border: `1px solid ${border}` }}>
        <Header />
        <div style={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 22, textAlign: 'center', margin: '0 10%' }}>
          L'espace de commentaire n'est pas activé sur cette page.
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 480, backgroundColor: 'white', padding: 10, border: `1px solid ${border}` }}>
      <Router>

        <Header />
        <Navigation />

        <Route path="/" exact render={() => <Redirect to="/reactions" />} />
        <Route
          path="/reaction"
          exact
          render={props => <StandaloneReactionsPage {...props} information={information} />}
        />

        <Route path="/subject" exact render={props => <SubjectsListPage {...props} information={information} />} />
        <Route path="/subject/:id" exact component={SubjectPage} />

      </Router>
    </div>
  );
};

export default Integration;

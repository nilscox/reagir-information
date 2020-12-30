import React from 'react';

import { Typography } from '@material-ui/core';

import { WebsiteLink } from '../../../components/Link';
import NotificationComponent, { NotificationProps } from '../NotificationComponent';

import imageCharter from './charter.png';

type RulesUpdateNotificationProps = NotificationProps<'rulesUpdate'>;

const RulesUpdateNotification: React.FC<RulesUpdateNotificationProps> = ({ notification, markAsSeen }) => (
  <NotificationComponent
    title={
      <>
        <strong>La charte</strong> a été mise à jour !
      </>
    }
    date={notification.created}
    seen={notification.seen}
    subTitle={
      <>
        La <strong>version {notification.payload.version}</strong> de la charte est disponible{' '}
        <WebsiteLink to="/charte.html" onClick={markAsSeen}>
          sur le site de Zétécom
        </WebsiteLink>
        .
      </>
    }
    text={
      <Typography>
        <WebsiteLink to={`/charte-v${notification.payload.version}.html`} onClick={markAsSeen}>
          Voir les détails
        </WebsiteLink>
      </Typography>
    }
    imageSrc={imageCharter}
    markAsSeen={markAsSeen}
  >
    La charte a été mise à jour ! Nouvelle version : <strong>{notification.payload.version}</strong>
  </NotificationComponent>
);

export default RulesUpdateNotification;
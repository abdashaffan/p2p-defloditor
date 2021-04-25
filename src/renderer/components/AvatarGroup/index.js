import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Tooltip from '@material-ui/core/Tooltip';


export default function CustomAvatarGroup(props) {
  return (
    <AvatarGroup max={5}>
      {
        // eslint-disable-next-line react/prop-types
        props.peers.map(peer => (
          <Tooltip title={`${peer.name} ${peer.isMe ? '(You)' : ''}`} key={peer.selfId}>
            <Avatar alt={peer.name} style={{backgroundColor: peer.color}}>{peer.name[0].toUpperCase()}</Avatar>
          </Tooltip>
        ))
      }
    </AvatarGroup>
  );
}
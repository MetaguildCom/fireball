import { Avatar } from '@mui/material';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';

import { CustomTooltip } from 'components/custom/CustomTooltip';
import { ItemUtils } from 'utils';
import { GotchiverseUtils } from 'utils';

import { GotchiSvgByStats } from './GotchiSvgByStats';
import { GotchiSvg } from './GotchiSvg';
import { styles } from './styles';

interface GotchiImageProps {
    gotchi: any;
    renderSvgByStats?: any;
    portal?: any;
}

export function GotchiImage({ gotchi, renderSvgByStats, portal }: GotchiImageProps) {
    const classes = styles();

    return (
        <div className={classes.gotchiSvg}>
            <span className={classes.gotchiHaunt}>h{gotchi.hauntId}</span>
            {portal ? (
                <img
                    className={classes.gotchiSvgPortal}
                    src={ItemUtils.getPortalImg(gotchi.hauntId)}
                    alt={`haunt-${gotchi.hauntId}-portal`}
                    width='100%' />
            ) : (
                null
            )}
            {
                renderSvgByStats ? (
                    <GotchiSvgByStats gotchi={gotchi} size='100%' />
                ) : (
                    <GotchiSvg id={gotchi.id} size='100%' />
                )
            }
            {
                gotchi.whitelistId && <div className={classes.whitelist}>
                    <PlaylistAddCheckOutlinedIcon fontSize='small'/>
                    {gotchi.whitelistId}
                </div>
            }
            {
                gotchi.guild && <div className={classes.guild}>
                    <CustomTooltip
                        title={GotchiverseUtils.getGuildName(gotchi.guild)}
                        placement='top'
                        followCursor
                    >
                        <Avatar
                            className={classes.guildAvatar}
                            src={GotchiverseUtils.getGuildImg(gotchi.guild)}
                        />
                    </CustomTooltip>
                </div>
            }
        </div>
    );
}

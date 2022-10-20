import { styled } from '@nextui-org/react';

export const StyledBadge = styled('span', {
  display: 'inline-block',
  textTransform: 'uppercase',
  padding: '$2 $3',
  margin: '0 2px',
  fontSize: '14px',
  fontWeight: '$bold',
  borderRadius: '14px',
  letterSpacing: '0.6px',
  lineHeight: 1,
  boxShadow: '1px 2px 5px 0px rgb(0 0 0 / 5%)',
  alignItems: 'center',
  alignSelf: 'center',
  color: '$white',
  variants: {
    type: {
      enable: {
        bg: '$successLight',
        color: '$successLightContrast'
      },
      cancel: {
        bg: '$errorLight',
        color: '$errorLightContrast'
      },
      process: {
        bg: '$warningLight',
        color: '$warningLightContrast'
      },
      pending: {
        bg: '$warningLight',
        color: '$warningLightContrast'
      },
      paid: {
        bg: '$successLight',
        color: '$successLightContrast'
      }
    }
  },
  defaultVariants: {
    type: 'active'
  }
});
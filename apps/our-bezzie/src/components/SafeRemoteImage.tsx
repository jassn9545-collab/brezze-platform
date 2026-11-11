import React, { FC, useEffect, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

type SafeRemoteImageProps = Omit<ImageProps, 'source'> & {
  uri?: string | null;
  fallback: ImageSourcePropType;
};

export const SafeRemoteImage: FC<SafeRemoteImageProps> = ({
  uri,
  fallback,
  onError,
  ...props
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  return (
    <Image
      {...props}
      source={!uri || failed ? fallback : {uri}}
      onError={event => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
};

import { useHuntColors } from '@/theme/colors';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import QRCode from 'qrcode';
import { SvgXml } from 'react-native-svg';

type VoucherQrProps = {
  value: string;
  size?: number;
  label?: string;
};

export function VoucherQr({ value, size = 84, label = 'QR code to redeem your prize' }: VoucherQrProps) {
  const colors = useHuntColors();
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void QRCode.toString(value, {
      type: 'svg',
      margin: 0,
      color: { dark: colors.ink, light: '#00000000' },
    }).then((svg) => {
      if (live) setXml(svg);
    });
    return () => {
      live = false;
    };
  }, [colors.ink, value]);

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {xml ? <SvgXml xml={xml} width={size} height={size} /> : null}
    </View>
  );
}

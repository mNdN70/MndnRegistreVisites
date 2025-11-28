"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/PageContainer';
import Image from 'next/image';
import './styles.css';
import { useTranslation } from '@/hooks/use-translation';

function SafetyNormsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecked, setIsChecked] = useState(false);
  const entryType = searchParams.get('type') || 'general';
  const { t } = useTranslation();

  const handleContinue = () => {
    if (isChecked) {
      const path = entryType === 'transporter' ? '/entrada-transportistas' : '/entrada';
      router.push(path);
    }
  };

  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-4xl shadow-xl bg-white">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Image src="https://www.menadiona.com/wp-content/uploads/2020/05/logo-menadiona.png" alt="MENADIONA Logo" width={200} height={100} />
            </div>
          <CardTitle className="font-headline text-2xl md:text-3xl">{t('safety_norms_title')}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <ul>
            <li>{t('safety_norm_1')}</li>
            <li>{t('safety_norm_2')}</li>
            <li>{t('safety_norm_3')}</li>
            <li>{t('safety_norm_4')}</li>
            <li>{t('safety_norm_5')}</li>
            <li>{t('safety_norm_6')}</li>
            <li>{t('safety_norm_7')}</li>
            <div className="flex justify-center my-4">
                <Image src="https://www.safetysigns.com/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/a/s/assembly-point-sign-k2-0050_2.png" alt="Punt de Trobada" width={200} height={113} data-ai-hint="assembly point" />
            </div>
            <li>{t('safety_norm_8')}</li>
             <div className="flex justify-center my-4">
                <Image src="https://as1.ftcdn.net/v2/jpg/01/21/53/38/1000_F_121533815_iRsoxV2if3I2S58h42JkHr5Yx3pGr26c.jpg" alt="Cámaras de seguridad" width={100} height={55} data-ai-hint="cctv camera" />
            </div>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
           <div className="flex items-center space-x-2">
            <Checkbox id="accept" checked={isChecked} onCheckedChange={() => setIsChecked(!isChecked)} />
            <label
              htmlFor="accept"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('accept_safety_norms')}
            </label>
          </div>
          <div className='flex justify-between gap-4'>
            <Button variant="outline" onClick={() => router.push('/')}>{t('cancel')}</Button>
            <Button onClick={handleContinue} disabled={!isChecked}>
              {t('continue')}
            </Button>
          </div>
          <div className="mt-4 text-left w-full">
            <p className="text-[10px] text-muted-foreground font-body">
              {t('gdpr_text')}
            </p>
             <p className="mt-2 text-[10px] text-muted-foreground font-body text-right">
              SHE N.S.T.004/05.24
            </p>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}


export default function SafetyNormsPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div>{t('loading')}</div>}>
            <SafetyNormsContent />
        </Suspense>
    )
}

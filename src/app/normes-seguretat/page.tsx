"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/PageContainer';
import Image from 'next/image';
import './styles.css';

function SafetyNormsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecked, setIsChecked] = useState(false);
  const entryType = searchParams.get('type') || 'general';

  const handleContinue = () => {
    if (isChecked) {
      const path = entryType === 'transporter' ? '/entrada-transportistas' : '/entrada';
      router.push(path);
    }
  };

  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Image src="/menadiona-logo.png" alt="Menadiona Logo" width={200} height={50} />
            </div>
          <CardTitle className="font-headline text-2xl md:text-3xl">NORMES BÀSIQUES DE SEGURETAT EN LES INSTAL.LACIONS: PERSONAL EXTERN</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <ul>
            <li>Respecteu la senyalització interna de la fàbrica.</li>
            <li>És obligatori l’ús dels Equips de Protecció Individual (EPIs) a les zones senyalitzades.</li>
            <li>Seguiu les indicacions del personal de Menadiona.</li>
            <li>En cas d’emergència, mantingueu la calma i seguiu les instruccions del personal i la senyalització d’evacuació.</li>
            <li>No accediu a zones no autoritzades.</li>
            <li>Prohibit fumar en tot el recinte de la fàbrica, excepte a les zones habilitades per a fer-ho.</li>
            <li>Informeu de qualsevol incident o condició insegura que observeu.</li>
            <li>Els vehicles han de respectar les normes de circulació internes i els límits de velocitat.</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
           <div className="flex items-center space-x-2">
            <Checkbox id="accept" checked={isChecked} onCheckedChange={() => setIsChecked(!isChecked)} />
            <label
              htmlFor="accept"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              He llegit i accepto les normes bàsiques de seguretat en les instal·lacions.
            </label>
          </div>
          <div className='flex justify-between gap-4'>
            <Button variant="outline" onClick={() => router.push('/')}>Cancel·la</Button>
            <Button onClick={handleContinue} disabled={!isChecked}>
              Continua
            </Button>
          </div>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}


export default function SafetyNormsPage() {
    return (
        <Suspense fallback={<div>Carregant...</div>}>
            <SafetyNormsContent />
        </Suspense>
    )
}

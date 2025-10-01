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
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-white">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
               <Image src="/logo.png" alt="Menadiona Logo" width={100} height={50} />
            </div>
          <CardTitle className="font-headline text-2xl md:text-3xl">NORMES BÀSIQUES DE SEGURETAT EN LES INSTAL.LACIONS: PERSONAL EXTERN</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <ul>
            <li>Se seguiran en tot moment les indicacions del personal referent a l'accés a les instal·lacions, càrrega i descàrrega de materials i qualsevol operació que guardi relació amb la prestació del servei.</li>
            <li>Està prohibit circular amb vehicles de motor en el recinte de la fàbrica. Els vehicles hauran d'aparcar-se en el pàrquing. Si calgués transportar materials o eines, hauran de sol·licitar permís en la Recepció. Respecti el límit de velocitat de 10 Km/h i les normes de circulació.</li>
            <li>Utilitzar els equips de protecció individual requerits per la normativa vigent de Seguretat i Higiene en el treball. En tot el recinte utilitzar ulleres de seguretat i casc protector, excepte en oficines. Cada empresa ha de proveir als seus empleats dels equips de protecció individual necessaris segons la tasca a realitzar.</li>
            <li>Prohibit fumar, menjar i ingerir begudes alcohòliques o estupefaents en tot el recinte. Prohibit utilitzar telèfons mòbils en tot el recinte, així com prendre fotografies o gravar.</li>
            <li>No manipular cap equip, instal·lació, dispositiu electrònic, dispositiu de seguretat, màquina, eina o material del centre si no està autoritzat per a això.</li>
            <li>Queda terminantment prohibit realitzar qualsevol tipus de foc en les instal·lacions de l'empresa.</li>
            <li>En cas d'emergència s'ha d'acudir al punt de trobada situada en l'entrada de fàbrica, al costat del pàrquing reservat i seguir les instruccions del Cap d'Emergència.</li>
            <div className="flex justify-center my-4">
                <Image src="/punt_reunio.png" alt="Punt de Trobada" width={200} height={113} />
            </div>
            <li>En compliment de l'article 12 del RGPD i l'article 22 de la LOPDGDD, s'Informa que MENADIONA té instal·lat un sistema de videovigilància.</li>
             <div className="flex justify-center my-4">
                <Image src="/camaras.png" alt="Cámaras de seguridad" width={100} height={55} />
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
              He llegit i accepto les normes bàsiques de seguretat en les instal.lacions.
            </label>
          </div>
          <div className='flex justify-between gap-4'>
            <Button variant="outline" onClick={() => router.push('/')}>Cancel·la</Button>
            <Button onClick={handleContinue} disabled={!isChecked}>
              Continua
            </Button>
          </div>
          <div className="mt-4 text-left w-full">
            <p className="text-[10px] text-muted-foreground font-body">
              En compliment del Reglament (UE) 2016/679 (RGPD) i la Llei 3/2018 (LOPDGDD), l'informem que les seves dades seran tractades per 'Menadiona, SL' amb la finalitat de gestió i control de la informació de seguretat de les seves instal·lacions. Pot exercir els seus drets dirigint-se a 'Menadiona, SL' per e-mail a menadiona@menadiona.com. Més informació en www.menadiona.com
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
    return (
        <Suspense fallback={<div>Carregant...</div>}>
            <SafetyNormsContent />
        </Suspense>
    )
}

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroMaterials,
  ViroSphere,
} from '@reactvision/react-viro';

type Language = 'en' | 'ar' | 'fr';
type Point3 = [number, number, number];
type Props = { mode: 'distance' | 'room' | 'height'; units: 'metric' | 'imperial'; language: Language };

const GOLD = '#E9B85D';
ViroMaterials.createMaterials({
  danatGold: { diffuseColor: '#E9B85D', lightingModel: 'Lambert' },
  danatWhite: { diffuseColor: '#FFFFFF', lightingModel: 'Lambert' },
});

function distance3(a: Point3, b: Point3) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function polygonArea3D(points: Point3[]) {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    nx += (current[1] - next[1]) * (current[2] + next[2]);
    ny += (current[2] - next[2]) * (current[0] + next[0]);
    nz += (current[0] - next[0]) * (current[1] + next[1]);
  }
  return Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
}

function formatDistance(meters: number, units: 'metric' | 'imperial') {
  return units === 'metric' ? meters.toFixed(2) + ' m' : (meters * 3.28084).toFixed(2) + ' ft';
}

function DanatARScene(props: any) {
  const sceneRef = React.useRef<any>(null);
  const appProps = props.sceneNavigator.viroAppProps;
  const points: Point3[] = appProps.points || [];

  const markPoint = React.useCallback(async () => {
    try {
      const scene = sceneRef.current;
      if (!scene) return;
      const camera = await scene.getCameraOrientationAsync();
      // Viro 2.53.0 supports a camera-forward ray on both ARCore and ARKit.
      // performARHitTestWithWorldPoints is not available on iOS in this version.
      const hits = await scene.performARHitTestWithRay(camera.forward);
      const preferred = hits.find((hit: any) => {
        if (appProps.mode === 'height') {
          return hit.type === 'ExistingPlane' || hit.type === 'ExistingPlaneUsingExtent' ||
            hit.type === 'DepthPoint' || hit.type === 'FeaturePoint';
        }
        return hit.type === 'ExistingPlaneUsingExtent' || hit.type === 'ExistingPlane' ||
          hit.type === 'EstimatedHorizontalPlane' || hit.type === 'DepthPoint';
      });
      const hit = preferred || hits[0];
      const position = hit?.transform?.position;
      if (!Array.isArray(position) || position.length < 3 || !position.every(Number.isFinite)) {
        appProps.onMessage('no-hit');
        return;
      }
      appProps.onPoint([position[0], position[1], position[2]]);
    } catch (error) {
      appProps.onMessage('hit-error');
    }
  }, [appProps]);

  React.useEffect(() => {
    appProps.onSceneReady(markPoint);
  }, []);

  return (
    <ViroARScene
      ref={sceneRef}
      anchorDetectionTypes={['PlanesHorizontal', 'PlanesVertical']}
      onTrackingUpdated={(state: number) => appProps.onTracking(state)}
    >
      {points.map((point, index) => (
        <ViroSphere
          key={'point-' + index}
          position={point}
          radius={0.025}
          materials={['danatGold']}
        />
      ))}
    </ViroARScene>
  );
}

export default function ARMeasurementView({ mode, units, language }: Props) {
  const [points, setPoints] = React.useState<Point3[]>([]);
  const [markAction, setMarkAction] = React.useState<null | (() => void)>(null);
  const [tracking, setTracking] = React.useState('initializing');
  const [message, setMessage] = React.useState('');
  const [finished, setFinished] = React.useState(false);

  const t = (en: string, ar: string, fr: string) => language === 'ar' ? ar : language === 'fr' ? fr : en;
  const perimeter = points.length >= 2
    ? points.reduce((sum, point, index) => sum + (index < points.length - 1 ? distance3(point, points[index + 1]) : (finished && mode === 'room' ? distance3(point, points[0]) : 0)), 0)
    : 0;
  const area = mode === 'room' && points.length >= 3 && finished ? polygonArea3D(points) : 0;
  const distance = mode === 'distance' && points.length === 2 ? distance3(points[0], points[1]) : 0;
  const height = mode === 'height' && points.length === 2 ? Math.abs(points[1][1] - points[0][1]) : 0;

  const onPoint = (point: Point3) => {
    setPoints(old => {
      if ((mode === 'distance' || mode === 'height') && old.length >= 2) return old;
      if (mode === 'room' && finished) return old;
      return [...old, point];
    });
    setMessage('');
    if (mode === 'distance') {
      setFinished(points.length >= 1);
    }
  };

  const reset = () => {
    setPoints([]);
    setFinished(false);
    setMessage('');
  };

  const onMarkReady = (fn: () => void) => setMarkAction(() => fn);

  const markPoint = () => {
    if (!markAction) {
      setMessage(t('AR session is starting. Move the phone slowly and try again.', 'جلسة الواقع المعزز قيد التشغيل. حرّك الهاتف ببطء وحاول مجدداً.', 'La session AR démarre. Déplacez lentement le téléphone et réessayez.'));
      return;
    }
    markAction();
  };

  const onMessage = (code: string) => {
    if (code === 'no-hit') setMessage(t('No surface detected at the reticle. Aim at a textured floor or wall and try again.', 'لم يتم اكتشاف سطح عند المؤشر. وجّه الهاتف إلى أرضية أو جدار واضح التفاصيل وحاول مجدداً.', 'Aucune surface détectée au réticule. Visez un sol ou un mur texturé puis réessayez.'));
    else setMessage(t('AR point capture failed. Move slowly and retry.', 'تعذر التقاط نقطة AR. حرّك الهاتف ببطء ثم أعد المحاولة.', 'Échec de capture du point AR. Déplacez lentement le téléphone et réessayez.'));
  };

  const finishRoom = () => {
    if (points.length < 3) {
      setMessage(t('Mark at least three floor corners first.', 'حدد ثلاث زوايا أرضية على الأقل أولاً.', 'Marquez au moins trois coins du sol.'));
      return;
    }
    setFinished(true);
    setMessage(t('Floor boundary closed. Review the perimeter and area below.', 'تم إغلاق حدود الأرضية. راجع المحيط والمساحة أدناه.', 'Contour du sol fermé. Vérifiez le périmètre et la surface ci-dessous.'));
  };

  if (Platform.OS === 'web') {
    return (
      <View style={s.panel}>
        <Text style={s.title}>{t('AR measurement requires the native mobile app', 'يتطلب قياس AR تطبيق الهاتف الأصلي', 'La mesure AR nécessite l’application mobile native')}</Text>
        <Text style={s.note}>{t('The browser cannot access ARCore or ARKit world tracking. Install a native development build on a compatible phone to use this tool.', 'لا يستطيع المتصفح الوصول إلى تتبع ARCore أو ARKit. ثبّت نسخة تطوير أصلية على هاتف متوافق لاستخدام هذه الأداة.', 'Le navigateur ne peut pas accéder au suivi ARCore ou ARKit. Installez une version native de développement sur un téléphone compatible.')}</Text>
      </View>
    );
  }

  return (
    <View style={s.wrapper}>
      <View style={s.camera}>
        <ViroARSceneNavigator
          autofocus
          depthEnabled
          initialScene={{ scene: DanatARScene as any }}
          viroAppProps={{
            mode,
            points,
            onPoint,
            onSceneReady: onMarkReady,
            onMessage,
            onTracking: (state: number) => setTracking(state === 3 ? 'ready' : state === 2 ? 'limited' : 'initializing'),
          }}
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={s.reticle}><View style={s.reticleH} /><View style={s.reticleV} /></View>
        <View style={s.cameraStatus}>
          <Text style={s.cameraStatusText}>
            {tracking === 'ready'
              ? t('SURFACE TRACKING READY', 'تتبع السطح جاهز', 'SUIVI DE SURFACE PRÊT')
              : tracking === 'limited'
              ? t('MOVE SLOWLY — TRACKING LIMITED', 'تحرك ببطء — التتبع محدود', 'BOUGEZ LENTEMENT — SUIVI LIMITÉ')
              : t('SCANNING — MOVE PHONE SLOWLY', 'جارٍ المسح — حرّك الهاتف ببطء', 'SCAN EN COURS — BOUGEZ LENTEMENT')}
          </Text>
        </View>
      </View>

      <View style={s.controls}>
        <Text style={s.instructions}>
          {mode === 'distance'
            ? (mode === 'height'
              ? t('Aim at the bottom of the object and mark its base. Then aim at the top and mark again.', 'وجّه المؤشر إلى أسفل الجسم وحدد القاعدة، ثم وجّهه إلى أعلاه وحدد مرة أخرى.', 'Visez la base de l’objet et marquez-la. Visez ensuite son sommet et marquez à nouveau.')
              : t('Aim the centre reticle at the first surface point and tap MARK POINT. Aim at the second point and mark again.', 'وجّه المؤشر الأوسط إلى نقطة السطح الأولى واضغط تحديد نقطة. وجّهه إلى النقطة الثانية وحددها مجدداً.', 'Visez le premier point avec le réticule central et appuyez sur MARQUER. Visez le second point et recommencez.'))
            : t('Aim at each floor corner and tap MARK CORNER. Mark at least three corners, then close the boundary.', 'وجّه المؤشر إلى كل زاوية أرضية واضغط تحديد زاوية. حدد ثلاث زوايا على الأقل ثم أغلق الحدود.', 'Visez chaque coin du sol et appuyez sur MARQUER. Marquez au moins trois coins puis fermez le contour.')}
        </Text>
        <View style={s.row}>
          <Pressable style={s.primary} onPress={markPoint} disabled={(mode !== 'room' && points.length >= 2) || (mode === 'room' && finished)}>
            <Text style={s.primaryText}>{t(mode === 'room' ? 'MARK CORNER' : mode === 'height' ? (points.length === 0 ? 'MARK BASE' : 'MARK TOP') : 'MARK POINT', mode === 'room' ? 'تحديد زاوية' : mode === 'height' ? (points.length === 0 ? 'تحديد القاعدة' : 'تحديد القمة') : 'تحديد نقطة', mode === 'room' ? 'MARQUER LE COIN' : mode === 'height' ? (points.length === 0 ? 'MARQUER LA BASE' : 'MARQUER LE SOMMET') : 'MARQUER LE POINT')}</Text>
          </Pressable>
          {mode === 'room' && !finished && (
            <Pressable style={s.secondary} onPress={finishRoom}>
              <Text style={s.secondaryText}>{t('CLOSE', 'إغلاق', 'FERMER')}</Text>
            </Pressable>
          )}
        </View>
        {message ? <Text style={s.note}>{message}</Text> : null}
        <View style={s.result}>
          {mode === 'distance' ? (
            <>
              <Text style={s.resultLabel}>{t('MEASURED DISTANCE', 'المسافة المقاسة', 'DISTANCE MESURÉE')}</Text>
              <Text style={s.resultValue}>{distance > 0 ? formatDistance(distance, units) : '—'}</Text>
              <Text style={s.small}>{t(points.length + ' of 2 points marked', 'تم تحديد ' + points.length + ' من نقطتين', points.length + ' point(s) sur 2')}</Text>
            </>
          ) : mode === 'height' ? (
            <>
              <Text style={s.resultLabel}>{t('VERTICAL HEIGHT', 'الارتفاع العمودي', 'HAUTEUR VERTICALE')}</Text>
              <Text style={s.resultValue}>{height > 0 ? formatDistance(height, units) : '—'}</Text>
              <Text style={s.small}>{t(points.length + ' of 2 points marked (base and top)', 'تم تحديد ' + points.length + ' من نقطتين (القاعدة والقمة)', points.length + ' point(s) sur 2 (base et sommet)')}</Text>
            </>
          ) : (
            <>
              <Text style={s.resultLabel}>{t('FLOOR PERIMETER', 'محيط الأرضية', 'PÉRIMÈTRE DU SOL')}</Text>
              <Text style={s.resultValue}>{finished ? formatDistance(perimeter, units) : '—'}</Text>
              <Text style={s.resultLabel}>{t('FLOOR AREA', 'مساحة الأرضية', 'SURFACE DU SOL')}</Text>
              <Text style={s.resultValue}>{finished ? (units === 'metric' ? area.toFixed(2) + ' m²' : (area * 10.7639).toFixed(2) + ' ft²') : '—'}</Text>
              <Text style={s.small}>{t(points.length + ' corners marked', 'عدد الزوايا المحددة: ' + points.length, points.length + ' coins marqués')}</Text>
            </>
          )}
        </View>
        <Pressable style={s.reset} onPress={reset}><Text style={s.resetText}>{t('RESET MEASUREMENT', 'إعادة ضبط القياس', 'RÉINITIALISER')}</Text></Pressable>
        <Text style={s.disclaimer}>{t('AR results depend on device support, lighting, surface texture and tracking quality. Recheck critical dimensions with a professional measuring tool.', 'تعتمد نتائج AR على دعم الجهاز والإضاءة وملمس السطح وجودة التتبع. تحقق من الأبعاد المهمة بأداة قياس احترافية.', 'Les résultats AR dépendent de l’appareil, de l’éclairage, de la texture et du suivi. Vérifiez les dimensions critiques avec un instrument professionnel.')}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { gap: 12 },
  camera: { height: 390, minHeight: 300, overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: '#79613A', backgroundColor: '#090D11' },
  reticle: { position: 'absolute', left: '50%', top: '50%', width: 28, height: 28, marginLeft: -14, marginTop: -14, alignItems: 'center', justifyContent: 'center' },
  reticleH: { position: 'absolute', width: 28, height: 2, backgroundColor: GOLD },
  reticleV: { position: 'absolute', width: 2, height: 28, backgroundColor: GOLD },
  cameraStatus: { position: 'absolute', top: 12, left: 12, right: 12, padding: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.65)' },
  cameraStatusText: { color: GOLD, fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 0.7 },
  controls: { borderWidth: 1, borderColor: '#5C4A2D', borderRadius: 16, padding: 14, backgroundColor: '#14191F', gap: 11 },
  instructions: { color: '#E4E5E7', fontSize: 12, lineHeight: 19, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 9 },
  primary: { flex: 1, borderRadius: 10, padding: 13, alignItems: 'center', backgroundColor: GOLD },
  primaryText: { color: '#17110A', fontWeight: '900', fontSize: 12 },
  secondary: { borderRadius: 10, padding: 13, alignItems: 'center', backgroundColor: '#302719', borderWidth: 1, borderColor: GOLD },
  secondaryText: { color: GOLD, fontWeight: '900', fontSize: 12 },
  result: { backgroundColor: '#080B0E', borderRadius: 12, padding: 14, alignItems: 'center', gap: 5 },
  resultLabel: { color: '#D2D4D7', fontSize: 11, fontWeight: '700' },
  resultValue: { color: GOLD, fontSize: 27, fontWeight: '900' },
  small: { color: '#9FA5AC', fontSize: 10 },
  note: { color: GOLD, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  reset: { borderWidth: 1, borderColor: '#79613A', borderRadius: 10, padding: 11, alignItems: 'center' },
  resetText: { color: GOLD, fontSize: 11, fontWeight: '900' },
  disclaimer: { color: '#9FA5AC', fontSize: 10, lineHeight: 16, textAlign: 'center' },
  panel: { borderWidth: 1, borderColor: '#5C4A2D', borderRadius: 16, padding: 16, backgroundColor: '#14191F', gap: 10 },
  title: { color: GOLD, fontWeight: '900', fontSize: 16, textAlign: 'center' },
});


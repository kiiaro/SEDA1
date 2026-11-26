import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Crop, Minus, Plus, RotateCw, RotateCcw, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { DarkModeTheme } from '../types';
import { MotionButton as TouchableOpacity } from './Motion';
import { clampCropPan, getCoverBaseSize } from '../lib/avatarCropUtils';
import { LoadedPhotoDraft, renderCroppedAvatarWeb } from '../lib/avatarUtils';

const CROP_VIEWPORT_SIZE = 240;

interface PhotoCropModalProps {
  photo: LoadedPhotoDraft | null;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void | Promise<void>;
  dm: DarkModeTheme;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  photo,
  onCancel,
  onConfirm,
  dm,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (photo) {
      setZoom(1);
      setRotationDeg(0);
      setPan({ x: 0, y: 0 });
      setApplying(false);
    }
  }, [photo?.dataUrl]);

  const coverSize = useMemo(() => {
    if (!photo) return { coverWidth: CROP_VIEWPORT_SIZE, coverHeight: CROP_VIEWPORT_SIZE };
    return getCoverBaseSize(photo.width, photo.height, rotationDeg, CROP_VIEWPORT_SIZE);
  }, [photo, rotationDeg]);

  const normalizedRot = ((rotationDeg % 360) + 360) % 360;
  const isSwapped = normalizedRot === 90 || normalizedRot === 270;
  const unrotatedWidth = isSwapped ? coverSize.coverHeight : coverSize.coverWidth;
  const unrotatedHeight = isSwapped ? coverSize.coverWidth : coverSize.coverHeight;

  const panRef = useRef(pan);
  panRef.current = pan;
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const coverRef = useRef(coverSize);
  coverRef.current = coverSize;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragOriginRef.current = { ...panRef.current };
      },
      onPanResponderMove: (_, gs) => {
        const clamped = clampCropPan(
          dragOriginRef.current.x + gs.dx,
          dragOriginRef.current.y + gs.dy,
          coverRef.current.coverWidth,
          coverRef.current.coverHeight,
          zoomRef.current,
          CROP_VIEWPORT_SIZE
        );
        setPan(clamped);
      },
    })
  ).current;

  const applyZoom = (nextZoomRaw: number) => {
    const nextZoom = Math.max(1, Math.min(3, Math.round(nextZoomRaw * 10) / 10));
    setZoom(nextZoom);
    setPan((curr) =>
      clampCropPan(
        curr.x,
        curr.y,
        coverSize.coverWidth,
        coverSize.coverHeight,
        nextZoom,
        CROP_VIEWPORT_SIZE
      )
    );
  };

  const handleRotate = () => {
    const nextRot = (rotationDeg + 90) % 360;
    setRotationDeg(nextRot);
    if (photo) {
      const nextCover = getCoverBaseSize(photo.width, photo.height, nextRot, CROP_VIEWPORT_SIZE);
      setPan((curr) =>
        clampCropPan(
          curr.x,
          curr.y,
          nextCover.coverWidth,
          nextCover.coverHeight,
          zoom,
          CROP_VIEWPORT_SIZE
        )
      );
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotationDeg(0);
    setPan({ x: 0, y: 0 });
  };

  const handleConfirm = async () => {
    if (!photo || applying) return;
    setApplying(true);
    try {
      const cropped = await renderCroppedAvatarWeb(photo.dataUrl, {
        naturalWidth: photo.width,
        naturalHeight: photo.height,
        rotationDeg,
        zoom,
        panX: pan.x,
        panY: pan.y,
        viewportSize: CROP_VIEWPORT_SIZE,
        outputSize: 256,
      });
      await onConfirm(cropped);
    } finally {
      setApplying(false);
    }
  };

  const zoomPercent = Math.round(((zoom - 1) / 2) * 100);

  return (
    <Modal visible={Boolean(photo)} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: dm.card, borderColor: dm.border }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleIcon}>
                <Crop size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: dm.text }]}>Formatar e Cortar Foto</Text>
                <Text style={[styles.subtitle, { color: dm.sub }]}>
                  Arraste para enquadrar no círculo do perfil
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Fechar editor de foto"
              style={[styles.closeBtn, { backgroundColor: dm.inputBg, borderColor: dm.border }]}
            >
              <X size={16} color={dm.sub} />
            </TouchableOpacity>
          </View>

          {/* Circular Crop Viewport */}
          <View style={styles.stageWrap}>
            <View
              {...panResponder.panHandlers}
              testID="photo-crop-viewport"
              style={[
                styles.cropCircle,
                { borderColor: COLORS.primary, backgroundColor: dm.inputBg },
                Platform.OS === 'web'
                  ? ({ cursor: 'grab', touchAction: 'none', userSelect: 'none' } as any)
                  : null,
              ]}
            >
              {photo ? (
                <Image
                  source={{ uri: photo.dataUrl }}
                  resizeMode="cover"
                  style={{
                    width: unrotatedWidth,
                    height: unrotatedHeight,
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: zoom },
                      { rotate: `${rotationDeg}deg` },
                    ],
                  }}
                />
              ) : null}
              <View pointerEvents="none" style={styles.innerGuideRing} />
            </View>
          </View>

          {/* Zoom Slider & Controls */}
          <View style={[styles.controlsBox, { backgroundColor: dm.inputBg, borderColor: dm.border }]}>
            <View style={styles.zoomHeader}>
              <Text style={[styles.controlLabel, { color: dm.sub }]}>Zoom e Corte</Text>
              <Text style={styles.zoomValue}>{zoom.toFixed(1)}x</Text>
            </View>

            <View style={styles.zoomRow}>
              <TouchableOpacity
                onPress={() => applyZoom(zoom - 0.2)}
                disabled={zoom <= 1}
                accessibilityRole="button"
                accessibilityLabel="Diminuir zoom"
                style={[
                  styles.zoomStepBtn,
                  { backgroundColor: dm.card, borderColor: dm.border, opacity: zoom <= 1 ? 0.45 : 1 },
                ]}
              >
                <Minus size={16} color={dm.text} />
              </TouchableOpacity>

              <View style={[styles.zoomTrack, { backgroundColor: dm.border }]}>
                <View style={[styles.zoomFill, { width: `${Math.max(4, zoomPercent)}%` }]} />
              </View>

              <TouchableOpacity
                onPress={() => applyZoom(zoom + 0.2)}
                disabled={zoom >= 3}
                accessibilityRole="button"
                accessibilityLabel="Aumentar zoom"
                style={[
                  styles.zoomStepBtn,
                  { backgroundColor: dm.card, borderColor: dm.border, opacity: zoom >= 3 ? 0.45 : 1 },
                ]}
              >
                <Plus size={16} color={dm.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.toolBtnsRow}>
              <TouchableOpacity
                onPress={handleRotate}
                accessibilityRole="button"
                accessibilityLabel="Girar foto 90 graus"
                style={[styles.toolChip, { backgroundColor: dm.card, borderColor: dm.border }]}
              >
                <RotateCw size={14} color={COLORS.secondary} />
                <Text style={[styles.toolChipText, { color: dm.text }]}>Girar 90°</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                accessibilityRole="button"
                accessibilityLabel="Centralizar foto"
                style={[styles.toolChip, { backgroundColor: dm.card, borderColor: dm.border }]}
              >
                <RotateCcw size={14} color={dm.sub} />
                <Text style={[styles.toolChipText, { color: dm.text }]}>Centralizar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancelar recorte"
              style={[styles.cancelBtn, { borderColor: dm.border, backgroundColor: dm.inputBg }]}
            >
              <Text style={[styles.cancelBtnText, { color: dm.text }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={applying}
              accessibilityRole="button"
              accessibilityLabel="Cortar e usar foto"
              style={styles.confirmBtn}
            >
              <Check size={16} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.confirmBtnText}>
                {applying ? 'Cortando...' : 'Cortar e usar foto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 182, 144, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cropCircle: {
    width: CROP_VIEWPORT_SIZE,
    height: CROP_VIEWPORT_SIZE,
    borderRadius: CROP_VIEWPORT_SIZE / 2,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerGuideRing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: CROP_VIEWPORT_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  controlsBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  zoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  zoomValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoomStepBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  zoomFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  toolBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toolChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  toolChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

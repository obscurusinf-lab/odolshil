import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { createItem, deleteItem, getItem, updateItem } from '@/db/items';
import { Direction, Kind, NewItemInput } from '@/db/types';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useI18n } from '@/i18n';
import { cancelForItem, ensureNotificationPermission, scheduleForItem } from '@/notifications';
import { useTheme } from '@/theme/ThemeProvider';
import { addDays, startOfDay } from '@/utils/date';

type DueOption = 'week' | 'month' | 'none' | 'custom';

export default function ItemFormScreen() {
  const params = useLocalSearchParams<{ id: string; direction?: Direction }>();
  const isNew = params.id === 'new';
  const { colors, typography, spacing } = useTheme();
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const { settings } = useAppSettings();

  const [direction, setDirection] = useState<Direction>(params.direction ?? 'out');
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [kind, setKind] = useState<Kind>('thing');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(language === 'ru' ? '₽' : '$');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [dueOption, setDueOption] = useState<DueOption>('none');
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; person?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    getItem(params.id).then((item) => {
      if (!item) {
        router.back();
        return;
      }
      setDirection(item.direction);
      setTitle(item.title);
      setPerson(item.person);
      setKind(item.kind);
      setAmount(item.amount !== null ? String(item.amount) : '');
      setCurrency(item.currency ?? (language === 'ru' ? '₽' : '$'));
      setNote(item.note ?? '');
      setPhotoUri(item.photoUri);
      setDueAt(item.dueAt);
      setDueOption(item.dueAt ? 'custom' : 'none');
    });
  }, [isNew, params.id]);

  const pickDue = useCallback((option: DueOption) => {
    setDueOption(option);
    const today = startOfDay(new Date());
    if (option === 'week') setDueAt(addDays(today, 7).getTime());
    else if (option === 'month') setDueAt(addDays(today, 30).getTime());
    else if (option === 'none') setDueAt(null);
    else setShowDatePicker(true);
  }, []);

  const handlePickContact = useCallback(async () => {
    try {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== 'granted') return;
      const picked = await Contacts.Contact.presentPicker();
      if (!picked) return;
      const details = await picked.getDetails([Contacts.ContactField.FULL_NAME]);
      if (details.fullName) setPerson(details.fullName);
    } catch {
      // пользователь закрыл пикер или платформа не поддерживает — просто ничего не делаем
    }
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (result.canceled || !result.assets[0]) return;
    try {
      const source = new File(result.assets[0].uri);
      const dest = new File(Paths.document, `odolshil-${Date.now()}.jpg`);
      source.copy(dest);
      setPhotoUri(dest.uri);
    } catch {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const validate = useCallback(() => {
    const next: { title?: string; person?: string } = {};
    if (!title.trim()) next.title = t('form.error.what');
    if (!person.trim()) next.person = t('form.error.who');
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [title, person, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);

    const input: NewItemInput = {
      title: title.trim(),
      person: person.trim(),
      direction,
      kind,
      amount: kind === 'money' ? Number(amount.replace(',', '.')) || null : null,
      currency: kind === 'money' ? currency.trim() || null : null,
      photoUri,
      note: note.trim() || null,
      dueAt,
    };

    const item = isNew ? await createItem(input) : await (async () => {
      await updateItem(params.id, input);
      return { ...(await getItem(params.id))! };
    })();

    if (dueAt !== null) {
      const granted = await ensureNotificationPermission(t);
      if (granted) {
        await scheduleForItem(item, settings.leadDays, settings.time, language);
      } else {
        await cancelForItem(item);
      }
    } else {
      await cancelForItem(item);
    }

    setSaving(false);
    router.back();
  }, [validate, title, person, direction, kind, amount, currency, photoUri, note, dueAt, isNew, params.id, settings, language, t]);

  const handleDelete = useCallback(() => {
    Alert.alert(t('form.delete.confirm.title'), t('form.delete.confirm.message'), [
      { text: t('form.cancel'), style: 'cancel' },
      {
        text: t('form.delete'),
        style: 'destructive',
        onPress: async () => {
          const item = await getItem(params.id);
          if (item) await cancelForItem(item);
          await deleteItem(params.id);
          router.back();
        },
      },
    ]);
  }, [params.id, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: spacing(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[typography.body, { color: colors.inkMuted }]}>{t('form.cancel')}</Text>
        </Pressable>
        <Text style={[typography.heading, { color: colors.ink }]}>
          {isNew ? t('form.title.add') : t('form.title.edit')}
        </Text>
        <Pressable onPress={handleSave} hitSlop={8} disabled={saving}>
          <Text style={[typography.bodyStrong, { color: colors.ink, opacity: saving ? 0.5 : 1 }]}>
            {t('form.save')}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}>
        <View style={{ marginBottom: spacing(2) }}>
          <SegmentedControl
            value={direction}
            onChange={setDirection}
            segments={[
              { value: 'out', label: t('form.direction.out') },
              { value: 'in', label: t('form.direction.in') },
            ]}
          />
        </View>

        <View style={{ marginBottom: spacing(2) }}>
          <SegmentedControl
            value={kind}
            onChange={setKind}
            segments={[
              { value: 'thing', label: t('form.field.kind.thing') },
              { value: 'money', label: t('form.field.kind.money') },
            ]}
          />
        </View>

        <TextField
          label={t('form.field.what')}
          placeholder={t('form.field.whatPlaceholder')}
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        {kind === 'money' ? (
          <View style={styles.row}>
            <View style={{ flex: 2, marginRight: spacing(1) }}>
              <TextField
                label={t('form.field.amount')}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label={t('form.field.currency')} value={currency} onChangeText={setCurrency} />
            </View>
          </View>
        ) : null}

        <TextField
          label={direction === 'out' ? t('form.field.whoOut') : t('form.field.whoIn')}
          placeholder={t('form.field.whoPlaceholder')}
          value={person}
          onChangeText={setPerson}
          error={errors.person}
        />
        <Pressable onPress={handlePickContact} style={{ marginTop: -spacing(1.5), marginBottom: spacing(2) }}>
          <Text style={[typography.caption, { color: colors.ink }]}>{t('form.field.contacts')}</Text>
        </Pressable>

        <Text style={[typography.label, { color: colors.inkMuted, marginBottom: spacing(0.75) }]}>
          {t('form.field.due')}
        </Text>
        <View style={[styles.row, { marginBottom: spacing(2), flexWrap: 'wrap' }]}>
          <View style={{ marginRight: spacing(1), marginBottom: spacing(1) }}>
            <Chip label={t('form.field.due.week')} active={dueOption === 'week'} onPress={() => pickDue('week')} />
          </View>
          <View style={{ marginRight: spacing(1), marginBottom: spacing(1) }}>
            <Chip label={t('form.field.due.month')} active={dueOption === 'month'} onPress={() => pickDue('month')} />
          </View>
          <View style={{ marginRight: spacing(1), marginBottom: spacing(1) }}>
            <Chip label={t('form.field.due.none')} active={dueOption === 'none'} onPress={() => pickDue('none')} />
          </View>
          <View style={{ marginBottom: spacing(1) }}>
            <Chip
              label={dueOption === 'custom' && dueAt ? new Date(dueAt).toLocaleDateString() : t('form.field.due.pick')}
              active={dueOption === 'custom'}
              onPress={() => pickDue('custom')}
            />
          </View>
        </View>
        {showDatePicker ? (
          <DateTimePicker
            value={dueAt ? new Date(dueAt) : new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setDueAt(startOfDay(date).getTime());
            }}
          />
        ) : null}

        <TextField
          label={t('form.field.note')}
          placeholder={t('form.field.notePlaceholder')}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Text style={[typography.label, { color: colors.inkMuted, marginBottom: spacing(0.75) }]}>
          {t('form.field.photo')}
        </Text>
        {photoUri ? (
          <View style={{ marginBottom: spacing(2) }}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <Pressable onPress={() => setPhotoUri(null)} style={{ marginTop: spacing(1) }}>
              <Text style={[typography.caption, { color: colors.ink }]}>{t('form.field.photo.remove')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={handlePickPhoto} style={{ marginBottom: spacing(2) }}>
            <Text style={[typography.caption, { color: colors.ink }]}>{t('form.field.photo.add')}</Text>
          </Pressable>
        )}

        {!isNew ? (
          <PrimaryButton label={t('form.delete')} variant="ghost" onPress={handleDelete} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  row: { flexDirection: 'row' },
  photo: { width: '100%', height: 180, borderRadius: 10 },
});

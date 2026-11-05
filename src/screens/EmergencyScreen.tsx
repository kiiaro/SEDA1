import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PhoneCall, Users } from 'lucide-react-native';
import { BackHeader } from '../components/BackHeader';
import { DarkModeTheme, FamilyMember } from '../types';
import { MotionButton as TouchableOpacity } from '../components/Motion';

interface Props {
  family: FamilyMember[];
  onBack: () => void;
  dm: DarkModeTheme;
}

export const EmergencyScreen: React.FC<Props> = ({ family, onBack, dm }) => {
  const call = async (number: string) => {
    try { await Linking.openURL(`tel:${number.replace(/[^\d+]/g, '')}`); }
    catch { Alert.alert('Ligação indisponível', `Use seu telefone para ligar para ${number}.`); }
  };

  return <ScrollView style={{ backgroundColor: dm.bg }} contentContainerStyle={styles.page}>
    <BackHeader title="Emergência" subtitle="Ligue para o SAMU 192" onBack={onBack} bgGradient={['#991B1B', '#E45454']} />
    <View style={styles.body}>
      <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <Text style={[styles.title, { color: dm.text }]}>Precisa de atendimento urgente?</Text>
        <Text style={[styles.description, { color: dm.sub }]}>O atendimento do SAMU começa por telefone. Ao tocar abaixo, o aplicativo abre a ligação; nenhum chamado é enviado automaticamente.</Text>
        <TouchableOpacity accessibilityLabel="Ligar para o SAMU 192" onPress={() => call('192')} style={styles.callButton}>
          <PhoneCall size={22} color="#FFFFFF" />
          <Text style={styles.callText}>Ligar 192</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <Text style={[styles.section, { color: dm.text }]}>Durante a ligação</Text>
        <Text style={[styles.description, { color: dm.sub }]}>Informe o endereço ou um ponto de referência, explique o que aconteceu e siga as orientações da central.</Text>
      </View>

      {family.length > 0 && <View style={[styles.card, { backgroundColor: dm.card, borderColor: dm.border }]}>
        <View style={styles.row}><Users size={19} color="#3D6E9F" /><Text style={[styles.section, { color: dm.text }]}>Seus contatos de apoio</Text></View>
        {family.filter((member) => member.phone).map((member) => <TouchableOpacity key={member.id} onPress={() => call(member.phone)} style={[styles.contact, { borderTopColor: dm.border }]}>
          <View><Text style={[styles.contactName, { color: dm.text }]}>{member.name}</Text><Text style={[styles.description, { color: dm.sub }]}>{member.phone}</Text></View>
          <PhoneCall size={18} color="#3D6E9F" />
        </TouchableOpacity>)}
      </View>}
    </View>
  </ScrollView>;
};

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingBottom: 32 },
  body: { padding: 16, gap: 14 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  section: { fontSize: 16, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21 },
  callButton: { backgroundColor: '#DC2626', minHeight: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  callText: { color: '#FFFFFF', fontWeight: '900', fontSize: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contact: { minHeight: 54, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  contactName: { fontSize: 14, fontWeight: '700' },
});

import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Button, Card } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Household'>;

export function HouseholdScreen({ navigation }: Props) {
  const householdMembers = useAppStore((state) => state.householdMembers);
  const activeMemberId = useAppStore((state) => state.activeMemberId);
  const addHouseholdMember = useAppStore((state) => state.addHouseholdMember);
  const renameHouseholdMember = useAppStore((state) => state.renameHouseholdMember);
  const removeHouseholdMember = useAppStore((state) => state.removeHouseholdMember);
  const switchActiveMember = useAppStore((state) => state.switchActiveMember);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addHouseholdMember(trimmed);
    setNewName('');
  };

  const confirmRemove = (id: string, name: string) => {
    Alert.alert(
      `Remove ${name}?`,
      'Their health profile will be removed from this device. Scans already saved for them stay in history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeHouseholdMember(id) },
      ]
    );
  };

  return (
    <ScreenLayout
      onBack={() => navigation.goBack()}
      title="Household profiles"
      subtitle="Switch between family members — each has their own allergies, dietary patterns, and goals. Scan history is shared, tagged with who it was for."
    >
      {householdMembers.length === 0 ? (
        <Card variant="outlined" className="mb-4">
          <Text className="text-body-sm text-neutral-500">
            You're currently on a single profile. Add a household member below to start switching
            between profiles before you scan.
          </Text>
        </Card>
      ) : (
        <Card variant="outlined" padding="none" className="px-4 mb-4">
          {householdMembers.map((member) => {
            const isActive = member.id === activeMemberId;
            const isEditing = editingId === member.id;
            return (
              <View
                key={member.id}
                className="flex-row items-center py-3 border-b border-neutral-100 last:border-b-0"
              >
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={`Switch to ${member.name}`}
                  onPress={() => switchActiveMember(member.id)}
                  className="flex-row items-center flex-1"
                >
                  <Ionicons
                    name={isActive ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isActive ? '#A8734F' : '#A89F92'}
                  />
                  {isEditing ? (
                    <TextInput
                      value={editingName}
                      onChangeText={setEditingName}
                      autoFocus
                      onBlur={() => {
                        if (editingName.trim()) renameHouseholdMember(member.id, editingName);
                        setEditingId(null);
                      }}
                      className="text-body text-neutral-800 ml-3 flex-1 border-b border-accent-300"
                    />
                  ) : (
                    <Text className="text-body text-neutral-800 ml-3 flex-1">{member.name}</Text>
                  )}
                </Pressable>
                {!isEditing && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Rename ${member.name}`}
                    onPress={() => {
                      setEditingId(member.id);
                      setEditingName(member.name);
                    }}
                    className="p-2"
                  >
                    <Ionicons name="create-outline" size={18} color="#A89F92" />
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${member.name}`}
                  onPress={() => confirmRemove(member.id, member.name)}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={18} color="#C45C4A" />
                </Pressable>
              </View>
            );
          })}
        </Card>
      )}

      <Card variant="outlined" className="mb-4">
        <Text className="text-body-sm text-neutral-500 mb-2">Add a household member</Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Sam"
            placeholderTextColor="#A89F92"
            accessibilityLabel="New household member name"
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-body text-neutral-800"
            onSubmitEditing={handleAdd}
          />
          <Button label="Add" onPress={handleAdd} disabled={!newName.trim()} />
        </View>
      </Card>

      {activeMemberId && (
        <Text className="text-caption text-neutral-400 text-center">
          You're currently scanning for{' '}
          {householdMembers.find((m) => m.id === activeMemberId)?.name ?? 'this profile'}. Edit
          their allergies and goals from Profile → Edit health profile.
        </Text>
      )}
    </ScreenLayout>
  );
}

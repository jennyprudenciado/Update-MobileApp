import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// route
import { styles } from "../styles/styles";
import { scheduleStyles } from "../styles/scheduleStyles";
import {
  formatDate,
  getNextWateringDate,
  getWateringStatus,
} from "../utils/date";
// for scheduling function
export default function ScheduleScreen({ plants, onWaterPlant }) {
  const sortedPlants = useMemo(() => {
    return [...plants].sort(
      (a, b) => getNextWateringDate(a) - getNextWateringDate(b)
    );
  }, [plants]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={sortedPlants}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Watering Schedule 💧</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No Plants in Schedule</Text>
            <Text style={styles.emptyText}>
              Add your first plant to start tracking its watering schedule.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getWateringStatus(item);

          return (
            <View style={scheduleStyles.scheduleCard}>
              <View style={scheduleStyles.scheduleIcon}>
                <Text style={scheduleStyles.scheduleEmoji}>🌿</Text>
              </View>

              <View style={scheduleStyles.scheduleInfo}>
                <Text style={scheduleStyles.schedulePlant}>{item.name}</Text>
                <Text style={scheduleStyles.scheduleDate}>
                  Next watering: {formatDate(getNextWateringDate(item))}
                </Text>
                <Text style={scheduleStyles.scheduleInterval}>
                  Every {item.interval} day{item.interval > 1 ? "s" : ""}
                </Text>
              </View>

              <View
                style={[
                  scheduleStyles.scheduleStatus,
                  status === "Due Today" && scheduleStyles.dueStatus,
                ]}
              >
                <Text
                  style={[
                    scheduleStyles.scheduleStatusText,
                    status === "Due Today" && scheduleStyles.dueStatusText,
                  ]}
                >
                  {status}
                </Text>
              </View>

              <Pressable
                style={scheduleStyles.smallWaterButton}
                onPress={() => onWaterPlant(item.id)}
              >
                <Text style={scheduleStyles.smallWaterButtonText}>💧 Water Now</Text>
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
import { dayjs, supabaseClient } from "@/lib";
import { Entities } from "@/lib/entities";
import {
  ErrorMessage,
  LoadingIndicator,
  useRefreshOnFocus,
  useSupabase,
} from "@/shared";
import { GymCheckIn } from "@/shared/types";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { MarkingProps } from "react-native-calendars/src/calendar/day/marking";
import { useCheckIns } from "../api/getCheckIns";

type MarkedDates = { [key: string]: MarkingProps };

export function Dashboard() {
  const { isPending, error, data, refetch } = useCheckIns();
  const { userId } = useSupabase();

  const [markedDates, setMarkedDates] = useState<MarkedDates>();
  const [selected, setSelected] = useState(
    dayjs().local().format("YYYY-MM-DD")
  );

  useEffect(() => {
    const markedDates: MarkedDates = {};
    if (data?.data?.length) {
      data.data.forEach((checkIn: GymCheckIn) => {
        const convertedDate = dayjs(checkIn.checkin_date)
          .local()
          .format("YYYY-MM-DD");
        markedDates[convertedDate] = { selected: true, selectedColor: "red" };
      });

      setMarkedDates(markedDates);
    }
  }, [data]);

  //TODO: const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);
  useRefreshOnFocus(refetch);

  async function handleCheckIn() {
    const { data, error } = await supabaseClient
      .from(Entities.gymCheckIn)
      .insert({
        user_id: userId,
        checkin_date: selected,
      })
      .select();
    console.log(data, error);
  }

  if (isPending) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error.message}></ErrorMessage>;
  }

  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        onDayPress={(day: DateData) => {
          setSelected(day.dateString);
        }}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          selectedDayBackgroundColor: "#00adf5",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#00adf5",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e",
        }}
        markedDates={{
          ...markedDates,
          [selected]: {
            selected: true,
            disableTouchEvent: true,
          },
        }}
      />
      <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
        <Text style={styles.btnText}>Check In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    paddingVertical: 20,
  },
  calendar: {
    //marginVertical: 10,
  },
  checkInBtn: {
    padding: 15,
    borderWidth: 2,
    borderRadius: 15,
    width: "75%",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 10,
  },
  btnText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});

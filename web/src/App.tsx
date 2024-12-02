import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { useAuth } from "./AuthProvider";
import { supabase } from "./lib";

import { Box, Button, Indicator, MantineProvider } from "@mantine/core";
import { Calendar, DatePickerInput } from "@mantine/dates";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);

async function getCheckIns(userId: string) {
  const { data, error } = await supabase
    .from("gym_checkin")
    .select("id, checkin_date")
    .eq("user_id", userId);

  if (error) {
    console.error("Error getting check-ins:", error.message);
    return;
  }

  return data;
}

async function saveCheckIn(userId: string, date: Date | null) {
  if (!date) {
    return;
  }

  const { data, error } = await supabase.from("gym_checkin").insert({
    user_id: userId,
    checkin_date: dayjs(date).utc().format(),
  });

  if (error) {
    console.error("Error saving check-in:", error.message);
    return;
  }

  console.log("Check-in saved:", data);
}

function App() {
  const { auth, signIn, signOut, user } = useAuth();

  const [value, setValue] = useState<Date | null>(null);
  const [checkIns, setCheckIns] = useState<Dayjs[]>([]);

  useEffect(() => {
    if (user?.id) {
      getCheckIns(user.id).then((data) => {
        if (data && data.length > 0) {
          const t = data.map((d) => dayjs(d.checkin_date));
          setCheckIns(t);
        }
      });
    }
  }, [user]);

  function isMarked(date: Date) {
    return checkIns.some(
      (markedDate) =>
        date.getDate() === markedDate.date() &&
        date.getMonth() === markedDate.month() &&
        date.getFullYear() === markedDate.year()
    );
  }

  return (
    <MantineProvider>
      <div>You are logged in and your email address is {user?.email}</div>

      {!auth && (
        <button
          onClick={() => {
            signIn();
          }}
        >
          Login
        </button>
      )}
      {auth && (
        <>
          <Calendar
            static
            renderDay={(date) => {
              const isDateMarked = isMarked(date);
              const day = date.getDate();
              return isDateMarked ? (
                <Indicator size={6} color="red" offset={-2}>
                  <div>{day}</div>
                </Indicator>
              ) : (
                <>{day}</>
              );
            }}
          />
          <Box my={20}>
            <DatePickerInput
              label="Pick date"
              placeholder="Pick date"
              value={value}
              onChange={setValue}
            />
          </Box>

          <Button
            mr={10}
            disabled={!value}
            onClick={async () => {
              await saveCheckIn(user!.id, value);
            }}
          >
            Save
          </Button>

          <Button
            onClick={() => {
              signOut();
            }}
          >
            Logout
          </Button>
        </>
      )}
    </MantineProvider>
  );
}

export default App;

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { useAuth } from "./AuthProvider";
import { supabase } from "./lib";

import { Box, Button, Indicator, MantineProvider } from "@mantine/core";
import { Calendar, DatePickerInput } from "@mantine/dates";
import { PostgrestError } from "@supabase/supabase-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useState } from "react";

dayjs.extend(utc);

function useGetCheckIns(userId?: string) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<
    { id: number; checkin_date: string }[] | null
  >([]);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("gym_checkin")
        .select("id, checkin_date")
        .eq("user_id", userId ?? "");

      if (error) {
        throw error;
      }

      setData(data);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

interface CheckIn {
  id: number;
  checkin_date: string;
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

function transformCheckIns(checkIns: CheckIn[]) {
  return checkIns.reduce((map, d) => {
    map.set(dayjs(d.checkin_date).format("MM-DD-YYYY"), d);
    return map;
  }, new Map<string, CheckIn>());
}

function App() {
  const { auth, signIn, signOut, user } = useAuth();

  const [value, setValue] = useState<Date | null>(null);

  const { data, error, loading, refetch } = useGetCheckIns(user?.id);

  // TODO: memo
  const test = transformCheckIns(data ?? []);

  // TODO: memo
  function isMarked(date: Date) {
    const key = dayjs(date).format("MM-DD-YYYY");
    return test.has(key);
  }

  return (
    <MantineProvider>
      {error && <div>Error: {error.message}</div>}
      {loading && <div>Loading...</div>}
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
              await refetch();
              setValue(null);
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

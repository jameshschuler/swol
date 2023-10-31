import { supabaseClient } from "@/lib";
import { Entities } from "@/lib/entities";
import { GymCheckIn } from "@/shared/types";
import { PostgrestResponse } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

function delay(t: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, t);
  });
}

async function getCheckIns(): Promise<PostgrestResponse<GymCheckIn>> {
  await delay(200 + Math.floor(Math.random() * 2000));

  return supabaseClient.from(Entities.gymCheckIn).select();
}

export const useCheckIns = () => {
  return useQuery({
    queryKey: [`gym_checkins`],
    queryFn: () => getCheckIns(),
  });
};

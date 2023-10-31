import React from "react";
import { SupabaseContext } from "../../context/SupabaseContext";

export const useSupabase = () => React.useContext(SupabaseContext);

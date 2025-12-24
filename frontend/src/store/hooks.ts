import type { RootState, AppDispatch } from "./index";
import {
  useSelector,
  useDispatch,
  type TypedUseSelectorHook,
} from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

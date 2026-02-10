import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

/**
 * Fetches the current user's profile from the backend users collection (role, displayName, etc.).
 * Use this for role-based UI or when you need DB user info beyond Firebase auth.
 *
 * @returns {{ userProfile: object | null, role: string, isLoading: boolean, isError: boolean, error: Error | null, refetch: function }}
 */
const useUserProfile = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const email = user?.email;

  const {
    data: userProfile = null,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", email],
    queryFn: async () => {
      try {
        const { data } = await axiosSecure.get("/users", {
          params: { email },
        });
        return data;
      } catch (err) {
        // 404 = user doc not synced yet (e.g. first login) – treat as default user
        if (err?.response?.status === 404) {
          return { email, role: "user" };
        }
        throw err;
      }
    },
    enabled: !!email?.trim(),
    retry: (failureCount, err) => err?.response?.status === 404 ? false : failureCount < 2,
    retryDelay: 300,
  });

  const role = userProfile?.role ?? "user";

  return {
    userProfile,
    role,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useUserProfile;

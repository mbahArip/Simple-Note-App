import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  Container,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { verifyToken } from "utils/jwt";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [isRegisterLoading, setIsRegisterLoading] = useState<boolean>(false);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
  const [isSnackbarFailed, setIsSnackbarFailed] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = `username=${username}&password=${password}`;

    fetch(`/api/auth/login`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        setIsSnackbarOpen(true);
        setIsSnackbarFailed(false);
        setSnackbarMessage("Login success! Redirecting...");

        const timeout = setTimeout(() => {
          router.push("/dashboard");
        }, 500);

        return () => clearTimeout(timeout);
      })
      .catch((err) => {
        setIsSnackbarOpen(true);
        setIsSnackbarFailed(true);
        setSnackbarMessage(err.message || "Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegisterLoading(true);

    const data = `username=${registerUsername}&password=${registerPassword}`;

    fetch(`/api/auth/register`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setIsRegisterLoading(false);

        setIsSnackbarOpen(true);
        setIsSnackbarFailed(false);
        setSnackbarMessage("Register success! You can login now.");

        setIsModalOpen(false);

        setRegisterUsername("");
        setRegisterPassword("");
      })
      .catch((err) => {
        setIsSnackbarOpen(true);
        setIsSnackbarFailed(true);
        setSnackbarMessage(err.message || "Something went wrong!");
        setIsRegisterLoading(false);
      });
  };

  const handleSignup = () => {
    setIsModalOpen(true);
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h3" m={4}>
        Login
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={2}
        width={"100%"}
      >
        <form
          id="login-form"
          onSubmit={handleLogin}
          className="flex flex-col gap-4 w-full"
        >
          <TextField
            label="Username"
            id="username"
            variant="standard"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            id="password"
            variant="standard"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LoadingButton
            variant="contained"
            loading={isLoading}
            fullWidth
            type="submit"
          >
            Login
          </LoadingButton>
        </form>

        <Button variant="text" fullWidth onClick={handleSignup}>
          Don&apos;t have an account? Sign up now!
        </Button>
        <Modal
          id="register-modal"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            display={"flex"}
            bgcolor={"background.paper"}
            color={"text.primary"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            gap={2}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h4" m={1}>
              Register
            </Typography>
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-4 w-full"
            >
              <TextField
                label="Username"
                id="register-username"
                variant="standard"
                fullWidth
                required
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
              <TextField
                label="Password"
                id="register-password"
                variant="standard"
                type="password"
                fullWidth
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <LoadingButton
                variant="contained"
                loading={isRegisterLoading}
                fullWidth
                type="submit"
              >
                Register
              </LoadingButton>
            </form>
          </Box>
        </Modal>
        <Snackbar
          id="snackbar"
          open={isSnackbarOpen}
          autoHideDuration={2000}
          onClose={() => setIsSnackbarOpen(false)}
        >
          {isSnackbarFailed ? (
            <Alert severity="error">{snackbarMessage}</Alert>
          ) : (
            <Alert severity="success">{snackbarMessage}</Alert>
          )}
        </Snackbar>
      </Box>
    </Container>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const cookies = context.req.headers.cookie;
  if (cookies) {
    const cookie = cookies.split(";").find((item) => {
      return item.trim().startsWith("authtoken=");
    });
    const cookieValue = cookie?.split("=")[1];
    const isCookieValid = verifyToken(cookieValue || "");
    if (isCookieValid) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    } else {
      context.res.setHeader(
        "Set-Cookie",
        "authtoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
    }
  }
  return {
    props: {},
  };
}

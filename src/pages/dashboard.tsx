import { Add, Delete, Edit } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { INote } from "types/db/note.type";
import { IUser } from "types/db/user.type";
import { verifyToken } from "utils/jwt";

type Props = {
  session: Pick<IUser, "id" | "username">;
};

export default function DashboardPage({ session }: Props) {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalIntent, setModalIntent] = useState<"edit" | "delete" | "create">(
    "edit"
  );

  const [createState, setCreateState] = useState<
    Pick<INote, "title" | "description">
  >({
    title: "",
    description: "",
  });
  const [editState, setEditState] = useState<
    Pick<INote, "title" | "description">
  >({
    title: "",
    description: "",
  });

  const [isCreateLoading, setIsCreateLoading] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [data, setData] = useState<INote[]>([]);
  const [selectedData, setSelectedData] = useState<INote | null>(null);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
  const [isSnackbarFailed, setIsSnackbarFailed] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleFetchData = () => {
    setIsDataLoading(true);
    fetch(`/api/note`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        setData(data.data as INote[]);
      })
      .catch((err) => {
        setData([]);
      })
      .finally(() => {
        setIsDataLoading(false);
      });
  };
  const handleLogout = () => {
    document.cookie =
      "authtoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };
  const handleCreate = () => {
    setIsEditLoading(true);

    const data = `title=${createState.title}&description=${createState.description}`;

    fetch(`/api/note`, {
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

        handleFetchData();
        setIsSnackbarFailed(false);
        setIsSnackbarOpen(true);
        setSnackbarMessage("Note created successfully!");

        setIsModalOpen(false);
      })
      .catch((err) => {
        setIsSnackbarFailed(true);
        setIsSnackbarOpen(true);
        setSnackbarMessage(err.message);
      })
      .finally(() => {
        setIsEditLoading(false);
      });
  };
  const handleEdit = () => {
    setIsEditLoading(true);
    if (!selectedData) {
      setIsSnackbarFailed(true);
      setIsSnackbarOpen(true);
      setSnackbarMessage(
        "Can't find selected data! Please refresh the page and try again."
      );
      return;
    }

    const data = `title=${editState.title}&description=${editState.description}`;

    fetch(`/api/note/${selectedData?.id}`, {
      method: "PUT",
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

        handleFetchData();
        setIsSnackbarFailed(false);
        setIsSnackbarOpen(true);
        setSnackbarMessage("Note updated successfully!");

        setIsModalOpen(false);
      })
      .catch((err) => {
        setIsSnackbarFailed(true);
        setIsSnackbarOpen(true);
        setSnackbarMessage(err.message);
      })
      .finally(() => {
        setIsEditLoading(false);
      });
  };
  const handleDelete = () => {
    setIsDeleteLoading(true);
    if (!selectedData) {
      setIsSnackbarFailed(true);
      setIsSnackbarOpen(true);
      setSnackbarMessage(
        "Can't find selected data! Please refresh the page and try again."
      );
      return;
    }

    const data = `title=${editState.title}&description=${editState.description}`;

    fetch(`/api/note/${selectedData?.id}`, {
      method: "DELETE",
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

        handleFetchData();
        setIsSnackbarFailed(false);
        setIsSnackbarOpen(true);
        setSnackbarMessage("Note deleted successfully!");

        setIsModalOpen(false);
      })
      .catch((err) => {
        setIsSnackbarFailed(true);
        setIsSnackbarOpen(true);
        setSnackbarMessage(err.message);
      })
      .finally(() => {
        setIsDeleteLoading(false);
      });
  };

  return (
    <Box>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              MyNote
            </Typography>
            <div>
              <IconButton
                size="small"
                onClick={(e) => {
                  setIsMenuOpen(true);
                  setMenuAnchor(e.currentTarget);
                }}
              >
                <Avatar
                  sx={{ bgcolor: "secondary.main", color: "text.primary" }}
                >
                  {session.username.slice(0, 1)}
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={menuAnchor}
                open={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem disableRipple disableTouchRipple>
                  <Typography variant="body1">{session.username}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl">
        {isDataLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              Fetching notes...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <Grid
              container
              spacing={4}
              mt={0}
              columns={{
                xs: 1,
                sm: 2,
                md: 4,
              }}
            >
              {data.length === 0 ? (
                <Grid item xs={1} sm={2} md={4}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ mt: 2 }}
                    textAlign={"center"}
                    width={"100%"}
                  >
                    You don&apos;t have any notes yet! Create one now.
                  </Typography>
                </Grid>
              ) : (
                <>
                  {data.map((item) => (
                    <Grid item xs={1} sm={1} md={1} key={item.id}>
                      <Card
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          padding: 2,
                        }}
                      >
                        <Stack>
                          <Typography
                            variant="h6"
                            component="div"
                            fontWeight={700}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="div"
                            sx={{
                              color: "text.secondary",
                            }}
                          >
                            Last updated:{" "}
                            {new Date(item.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" component="div">
                          {item.description}
                        </Typography>
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Fab
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedData(item);
                              setEditState({
                                title: item.title,
                                description: item.description,
                              });
                              setModalIntent("edit");
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit />
                          </Fab>
                          <Fab
                            color="error"
                            size="small"
                            onClick={() => {
                              setSelectedData(item);
                              setModalIntent("delete");
                              setIsModalOpen(true);
                            }}
                          >
                            <Delete />
                          </Fab>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </Box>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);

            if (modalIntent === "create") {
              setCreateState({
                title: "",
                description: "",
              });
            }
          }}
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
              {modalIntent === "create" && "Create Note"}
              {modalIntent === "edit" && "Edit Note"}
              {modalIntent === "delete" && "Delete Note"}
            </Typography>
            {modalIntent === "create" && (
              <form onSubmit={handleCreate}>
                <TextField
                  label="Title"
                  id="title"
                  variant="outlined"
                  fullWidth
                  required
                  value={createState.title}
                  onChange={(e) =>
                    setCreateState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <TextField
                  label="Description"
                  id="description"
                  variant="outlined"
                  multiline
                  minRows={4}
                  fullWidth
                  required
                  value={createState.description}
                  onChange={(e) =>
                    setCreateState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  margin="normal"
                />

                <Stack
                  direction="row"
                  justifyContent={"center"}
                  spacing={2}
                  mt={2}
                >
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Typography variant="button" component="div">
                      Cancel
                    </Typography>
                  </Button>
                  <LoadingButton
                    variant="contained"
                    loading={isCreateLoading}
                    type="submit"
                  >
                    <Typography variant="button" component="div">
                      Create Note
                    </Typography>
                  </LoadingButton>
                </Stack>
              </form>
            )}
            {modalIntent === "edit" && (
              <form onSubmit={handleEdit}>
                <TextField
                  label="Title"
                  id="title"
                  variant="outlined"
                  fullWidth
                  required
                  value={editState.title}
                  onChange={(e) =>
                    setEditState((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <TextField
                  label="Description"
                  id="description"
                  variant="outlined"
                  multiline
                  minRows={4}
                  fullWidth
                  required
                  value={editState.description}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  margin="normal"
                />

                <Stack
                  direction="row"
                  justifyContent={"center"}
                  spacing={2}
                  mt={2}
                >
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Typography variant="button" component="div">
                      Cancel
                    </Typography>
                  </Button>
                  <LoadingButton
                    variant="contained"
                    loading={isEditLoading}
                    type="submit"
                  >
                    <Typography variant="button" component="div">
                      Update Note
                    </Typography>
                  </LoadingButton>
                </Stack>
              </form>
            )}
            {modalIntent === "delete" && (
              <Box>
                <Typography variant="body1" component="div">
                  Are you sure you want to delete &quot;
                  <b>{selectedData?.title}</b>&quot;?
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  mt={2}
                  justifyContent={"center"}
                >
                  <Button
                    variant="contained"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <Typography variant="button" component="div">
                      Cancel
                    </Typography>
                  </Button>
                  <LoadingButton
                    variant="contained"
                    color="error"
                    loading={isDeleteLoading}
                    onClick={handleDelete}
                  >
                    <Typography variant="button" component="div">
                      Delete Note
                    </Typography>
                  </LoadingButton>
                </Stack>
              </Box>
            )}
          </Box>
        </Modal>
        <Snackbar
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
        <Fab
          color="primary"
          aria-label="add-note"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
          }}
          onClick={() => {
            setModalIntent("create");
            setIsModalOpen(true);
          }}
        >
          <Add />
        </Fab>
      </Container>
    </Box>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let session: Pick<IUser, "id" | "username"> | null = null;
  const cookies = context.req.headers.cookie;
  if (!cookies) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  if (cookies) {
    const cookie = cookies.split(";").find((item) => {
      return item.trim().startsWith("authtoken=");
    });
    const cookieValue = cookie?.split("=")[1];
    const isCookieValid = verifyToken(cookieValue || "");
    if (!isCookieValid) {
      context.res.setHeader(
        "Set-Cookie",
        "authtoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    } else {
      session = isCookieValid as Pick<IUser, "id" | "username">;
    }
  }
  return {
    props: {
      session,
    },
  };
}

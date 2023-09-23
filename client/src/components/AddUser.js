import {useState} from 'react';
import { Box, TextField, Button, Stack, Typography, Avatar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import CssBaseline from "@mui/material/CssBaseline";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// import { DropzoneDialog } from "material-ui-dropzone";

const AddUser = () => {
    /* 
    post function to create a user
     */

    // // for image drag dropzone
    // const [open, setOpen] = useState(false);

    const defaultTheme = createTheme();

    return (
        <div id="add-user-root">
            <Stack
                component="form"
                sx={{
                    width: "25ch",
                    m: 2,
                }}
                spacing={2}
                noValidate
                autoComplete="off"
            ></Stack>

            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <PersonAdd />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Add user
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={console.log("FORM SUBMITED")}
                            noValidate
                            sx={{ mt: 1 }}
                        >
                            <TextField
                                id="fname"
                                label="First name"
                                variant="standard"
                                fullWidth
                                defaultValue={""}
                            />
                            <br />
                            <TextField
                                id="lname"
                                label="Last name"
                                variant="standard"
                                fullWidth
                                defaultValue={""}
                            />

                            <Button
                                sx={{ mt: 3, mb: 2 }}
                                fullWidth
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}>
                                Upload Images
                                <input type="file" multiple hidden />
                            </Button>

                            {/* <Button
                                sx={{ mt: 3, mb: 2 }}
                                fullWidth
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                color="primary" onClick={() => setOpen(true)}>
                                Add Image
                            </Button>

                            <DropzoneDialog
                                acceptedFiles={["image/*"]}
                                cancelButtonText={"cancel"}
                                submitButtonText={"submit"}
                                maxFileSize={5000000}
                                open={open}
                                onClose={() => setOpen(false)}
                                onSave={(files) => {
                                    console.log("Files:", files);
                                    setOpen(false);
                                }}
                                showPreviews={true}
                                showFileNamesInPreview={true}
                            /> */}

                            <Button
                                type="submit"
                                sx={{ mt: 3, mb: 2 }}
                                fullWidth
                                variant="contained"
                                endIcon={<SendIcon />}
                                onClick={() => console.log("create user")}
                            >
                                Create
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
};

export default AddUser;

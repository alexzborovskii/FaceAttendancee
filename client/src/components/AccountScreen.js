import React, { useState } from "react";
import { TextField, Button,  Stack, Box } from "@mui/material";

const AccountScreen = () => {
    const [firstName, setFirstName] = useState("your first name");
    const [lastName, setLastName] = useState("your last name");
    const [email, setEmail] = useState("email@example.com");
    const [password, setPassword] = useState("****");

    function handleSubmit(event) {
        event.preventDefault();
        console.log("FORM SUBMITED");
        console.log(firstName, lastName, email, password);
    }

    return (
        <>
            <h2>Edit profile</h2>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1, width: "50%" }}>
                <Stack spacing={2} direction="row" sx={{ marginBottom: 4 }}>
                    <TextField
                        type="text"
                        variant="standard"
                        color="primary"
                        label="First Name"
                        onChange={(e) => setFirstName(e.target.value)}
                        value={firstName}
                        fullWidth
                        required
                    />
                    <TextField
                        type="text"
                        variant="standard"
                        color="primary"
                        label="Last Name"
                        onChange={(e) => setLastName(e.target.value)}
                        value={lastName}
                        fullWidth
                        required
                    />
                </Stack>
                <TextField
                    type="email"
                    variant="standard"
                    color="primary"
                    label="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    fullWidth
                    required
                    sx={{ mb: 4 }}
                />
                <TextField
                    type="password"
                    variant="standard"
                    color="primary"
                    label="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    fullWidth
                    sx={{ mb: 4 }}
                />
                <Button variant="contained" component="label" type="submit">
                    Save Changes
                </Button>
            </Box>
        </>
    );
};

export default AccountScreen;

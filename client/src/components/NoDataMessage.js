import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Header from "./Header";
import { Box, CardMedia } from "@mui/material";

export default function NoDataMessage() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ width: 400 }}>
                <CardMedia
                    sx={{ height: 400 }}
                    image="../../no_data.png"
                    title="no data"
                />
                <CardContent>
                    <Header title="There is no data yet!" />
                </CardContent>
            </Card>
        </Box>
    );
}

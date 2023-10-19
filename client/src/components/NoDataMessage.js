import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Header from "./Header";
import { Box, CardMedia } from "@mui/material";

export default function NoDataMessage() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center",  }}>
            <Card variant="outlined" sx={{ width: 400, borderRadius: "20px", background: "rgba(0,0,0,0)"}}>
                {/* <CardMedia
                    sx={{ height: "400" }}
                    image="../../no_data.png"
                    title="no data"
                /> */}
                <CardContent>
                    <Header title="There is no data!" />
                </CardContent>
            </Card>
        </Box>
    );
}

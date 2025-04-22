import React from "react";
import Form from "../components/Form/Form";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const FormPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ width: "80%", padding: 16, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
                <Button size="large" type="primary" onClick={() => navigate("/table")}>
                    Sifarişlərə keç
                </Button>
            </div>

            <Form />
        </div>
    );
};

export default FormPage;

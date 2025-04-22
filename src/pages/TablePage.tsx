import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import MyTable from "../components/Table/MyTable";


const TablePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ width: "90%", padding: 16, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button size="large" type="primary" onClick={() => navigate("/")}>
          Geri - Ana Səhifə
        </Button>
      </div>
      <MyTable/>
    </div>
  );
};

export default TablePage;

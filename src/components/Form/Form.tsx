import React, { useEffect, useState } from "react";
import { Form, Input, Button, DatePicker, message, Select, Modal } from "antd";
import axios from "axios";

const { Option } = Select;

const MyForm: React.FC = () => {
  const [form] = Form.useForm();
  const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchOwners = async () => {
      setLoadingOwners(true);
      try {
        const response = await axios.get("https://67faa1b08ee14a54262839ee.mockapi.io/orderOwners");
        setOwners(response.data);
      } catch (error) {
        console.error("Sahiblər alınmadı:", error);
        message.error("Sifariş sahibləri yüklənmədi.");
      } finally {
        setLoadingOwners(false);
      }
    };

    fetchOwners();
  }, []);

  const handleSubmit = async (values: any) => {
    if (
      !values.orderDate ||
      !values.orderOwner ||
      !values.orderEmail ||
      !values.orderForName ||
      !values.orderPrice
    ) {
      message.error("Xahiş edirəm bütün sahələri doldurun.");
      return;
    }

    try {
      // MockAPI-ə məlumat göndərmək üçün:
      await axios.post("https://67faa1b08ee14a54262839ee.mockapi.io/orders", {
        orderDate: values.orderDate,
        orderOwner: values.orderOwner,
        orderEmail: values.orderEmail,
        orderPrice: values.orderPrice,
        orderForName: values.orderForName,
        returnRequest: values.returnRequest || false,
      });

      setModalMessage("Məlumatlar uğurla göndərildi!");
      setIsModalOpen(true);

      form.resetFields();
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      message.error("Məlumatlar göndərilmədi.");
    }
  };

  // Modalı bağlamaq üçün funksiya
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        margin: "0 auto",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "30px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form.Item
          label="Sifariş Tarixi"
          name="orderDate"
          rules={[{ required: true, message: "Sifariş tarixini daxil edin!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Sifarişin Sahibi"
          name="orderOwner"
          rules={[{ required: true, message: "Sifarişin sahibini daxil edin!" }]}
        >
          <Select placeholder="Sahibi seçin" loading={loadingOwners} size="large">
            {owners.map((owner) => (
              <Option key={owner.id} value={owner.name}>
                {owner.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="E-mail"
          name="orderEmail"
          rules={[{ required: true, message: "E-mail ünvanını daxil edin!" }]}
        >
          <Input type="email" placeholder="E-mail ünvanınızı daxil edin" size="large" />
        </Form.Item>

        <Form.Item
          label="Sifariş Edilən Şəxs"
          name="orderForName"
          rules={[{ required: true, message: "Sifarişin edildiyi şəxsin adını daxil edin!" }]}
        >
          <Input placeholder="Sifarişin edildiyi şəxsin adı" size="large" />
        </Form.Item>

        <Form.Item
          label="Sifarişin Qiyməti"
          name="orderPrice"
          rules={[{ required: true, message: "Sifarişin qiymətini daxil edin!" }]}
        >
          <Input min={0} type="number" step="0.01" placeholder="Qiyməti daxil edin" size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Göndər
          </Button>
        </Form.Item>
      </Form>

      {/* Modal */}
      <Modal
        title="Uğurla əlavə edildi"
        open={isModalOpen} // 'visible' yerinə 'open' istifadə edin
        onCancel={handleModalClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleModalClose}>
            Tamam
          </Button>,
        ]}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default MyForm;

import React, { useEffect, useState, useRef } from "react";
import {
  Table as AntTable,
  message,
  Checkbox,
  Modal,
  Button,
  Dropdown,
  Input,
  Space,
  TableProps,
  InputRef,
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { SearchOutlined, ExclamationCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

interface Data {
  id: string;
  orderDate: string;
  orderOwner: string;
  orderEmail: string;
  orderForName: string;
  orderPrice: number;
  returnRequest: boolean;
}

const MyTable: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingData, setEditingData] = useState<Data | null>(null);
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Data[]>(
        "https://67faa1b08ee14a54262839ee.mockapi.io/orders"
      );
      const sorted = sortReturnRequests(response.data);
      setData(sorted);
      setFilteredData(sorted);
      const uniqueOwners = [...new Set(response.data.map(item => item.orderOwner))];
      setOwners(uniqueOwners);
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      message.error("Məlumatlar yüklənmədi.");
    } finally {
      setLoading(false);
    }
  };

  const sortReturnRequests = (data: Data[]) =>
    [...data].sort((a, b) => Number(a.returnRequest) - Number(b.returnRequest));

  const handleEdit = (record: Data) => {
    setEditingData(record);
    setModalVisible(true);
  };

  const handleDelete = (record: Data) => {
    Modal.confirm({
      title: "Silmək istədiyinizə əminsiniz?",
      icon: <ExclamationCircleOutlined />,
      content: "Bu sifariş birdəfəlik silinəcək.",
      okText: "Bəli",
      cancelText: "Xeyr",
      onOk: async () => {
        try {
          await axios.delete(`https://67faa1b08ee14a54262839ee.mockapi.io/orders/${record.id}`);
          const updated = data.filter(item => item.id !== record.id);
          const sorted = sortReturnRequests(updated);
          setData(sorted);
          setFilteredData(sorted);
          message.success("Sifariş silindi.");
        } catch (error) {
          console.error("Silinmə xətası:", error);
          message.error("Sifariş silinmədi.");
        }
      },
    });
  };

  const handleModalOk = async () => {
    if (!editingData) return;

    try {
      await axios.put(
        `https://67faa1b08ee14a54262839ee.mockapi.io/orders/${editingData.id}`,
        editingData
      );
      const updated = data.map((item) =>
        item.id === editingData.id ? editingData : item
      );
      const sorted = sortReturnRequests(updated);
      setData(sorted);
      setFilteredData(sorted);
      message.success("Sifariş uğurla yeniləndi.");
    } catch (error: any) {
      console.error("Yeniləmə xətası:", error);
      message.error("Yeniləmə zamanı xəta baş verdi.");
    } finally {
      setModalVisible(false);
      setEditingData(null);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingData(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Data
  ) => {
    if (editingData) {
      setEditingData({
        ...editingData,
        [field]: field === "orderPrice" ? Number(e.target.value) : e.target.value,
      });
    }
  };

  const handleFilterOwner = (owner: string | null) => {
    const filtered = owner
      ? data.filter((item) => item.orderOwner === owner)
      : data;
    setFilteredData(filtered);
  };

  const getColumnSearchProps = (
    dataIndex: keyof Data
  ): ColumnType<Data> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Axtarış`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Axtar
          </Button>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Sıfırla
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
  });

  const confirmCheckboxChange = (record: Data, checked: boolean) => {
    Modal.confirm({
      title: "Əminsiniz?",
      icon: <ExclamationCircleOutlined />,
      content: checked
        ? "Bu sifariş üçün qaytarılma tələbini aktivləşdirmək istəyirsiniz?"
        : "Qaytarılma tələbini ləğv etmək istəyirsiniz?",
      okText: "Bəli",
      cancelText: "Xeyr",
      onOk: async () => {
        const updatedRecord = { ...record, returnRequest: checked };
        try {
          await axios.put(
            `https://67faa1b08ee14a54262839ee.mockapi.io/orders/${record.id}`,
            updatedRecord
          );
          const updatedList = data.map((item) =>
            item.id === record.id ? updatedRecord : item
          );
          const sorted = sortReturnRequests(updatedList);
          setData(sorted);
          setFilteredData(sorted);
          message.success("Dəyişiklik yadda saxlanıldı.");
        } catch {
          message.error("Qaytarılma statusu dəyişdirilə bilmədi.");
        }
      },
    });
  };

  const columns: ColumnsType<Data> = [
    {
      title: "Sifariş Tarixi",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (text: string) => moment(text).format("DD.MM.YYYY"),
      sorter: (a, b) =>
        moment(a.orderDate).unix() - moment(b.orderDate).unix(),
    },
    {
      title: (
        <Dropdown
          menu={{
            items: [
              { key: "all", label: "Hamısı", onClick: () => handleFilterOwner(null) },
              ...owners.map((owner) => ({
                key: owner,
                label: owner,
                onClick: () => handleFilterOwner(owner),
              })),
            ],
          }}
          trigger={["click"]}
        >
          <Button>Sifarişin Sahibi ▼</Button>
        </Dropdown>
      ),
      dataIndex: "orderOwner",
      key: "orderOwner",
    },
    {
      title: "E-mail",
      dataIndex: "orderEmail",
      key: "orderEmail",
    },
    {
      title: "Sifariş Edilən Şəxs",
      dataIndex: "orderForName",
      key: "orderForName",
      ...getColumnSearchProps("orderForName"),
    },
    {
      title: "Sifarişin Qiyməti",
      dataIndex: "orderPrice",
      key: "orderPrice",
      render: (price: number) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: "Qaytarılma",
      dataIndex: "returnRequest",
      key: "returnRequest",
      render: (checked: boolean, record: Data) => (
        <Checkbox
          checked={checked}
          onChange={(e) => confirmCheckboxChange(record, e.target.checked)}
        />
      ),
    },
    {
      title: "Əməliyyatlar",
      key: "operations",
      render: (_: any, record: Data) => (
        <Space>
          <Button onClick={() => handleEdit(record)} type="primary">
            Redaktə et
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  const tableProps: TableProps<Data> = {
    columns,
    dataSource: filteredData,
    loading,
    rowKey: (record) => record.id,
    pagination: { pageSize: 10 },
    bordered: true,
    scroll: { x: "max-content" },
  };

  return (
    <div style={{ padding: 16, backgroundColor: "#fff", borderRadius: 8 }}>
      <AntTable {...tableProps} />

      <Modal
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        okText="Yenilə"
        cancelText="Bağla"
        title="Sifarişi Redaktə Et"
      >
        <div>
          <strong>Sifariş Tarixi:</strong>
          <Input value={editingData?.orderDate} onChange={(e) => handleInputChange(e, "orderDate")} />

          <strong>Sifariş Sahibi:</strong>
          <Input value={editingData?.orderOwner} onChange={(e) => handleInputChange(e, "orderOwner")} />

          <strong>E-mail:</strong>
          <Input value={editingData?.orderEmail} onChange={(e) => handleInputChange(e, "orderEmail")} />

          <strong>Sifariş Edilən Şəxs:</strong>
          <Input value={editingData?.orderForName} onChange={(e) => handleInputChange(e, "orderForName")} />

          <strong>Sifarişin Qiyməti:</strong>
          <Input value={editingData?.orderPrice} onChange={(e) => handleInputChange(e, "orderPrice")} />

          <strong>Qaytarılma:</strong>
          <Checkbox
            checked={editingData?.returnRequest}
            onChange={(e) =>
              setEditingData({
                ...editingData!,
                returnRequest: e.target.checked,
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default MyTable;

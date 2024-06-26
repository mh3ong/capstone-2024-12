import {
  DashboardOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  CloudDownloadOutlined,
  BulbFilled
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SideBar(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClicked = (e) => {
    navigate(e?.key || 'dashboard');
  };
  return (
    <Layout.Sider collapsible>
      <Menu
        selectedKeys={[location.pathname.split('/').pop()]}
        defaultSelectedKeys={['dashboard']}
        mode={'inline'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          border: 'none'
        }}
        onClick={handleMenuClicked}
      >
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          Dashboard
        </Menu.Item>
        <Menu.Item key="data" icon={<DatabaseOutlined />}>
          Data
        </Menu.Item>
        <Menu.Item key="model" icon={<ApartmentOutlined />}>
          Model
        </Menu.Item>
        <Menu.Item key="train" icon={<ExperimentOutlined />}>
          Train
        </Menu.Item>
        <Menu.Item key="inference" icon={<CloudDownloadOutlined />}>
          Inference
        </Menu.Item>
        <div style={{ flex: '1' }} />
        <Menu.Item key="new-model" icon={<BulbFilled />}>
          New Model
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  );
}

import { message } from 'antd';
import { CheckOutlined, BugOutlined, WarningOutlined, InfoOutlined } from '@ant-design/icons';

message.config({
  top: 100,
  duration: 3,
  maxCount: 1
});

export const toastSuccess = (content: string) => {
  message.open({
    type: 'success',
    content,
    icon: <CheckOutlined className='text-green-500' />
  });
};

export const toastError = (content: string) => {
  message.open({
    type: 'error',
    content,
    icon: <BugOutlined className='text-red-500' />
  });
};

export const toastWarn = (content: string) => {
  message.open({
    type: 'warning',
    content,
    icon: <WarningOutlined className='text-orange-500' />
  });
};

export const toastInfo = (content: string) => {
  message.open({
    type: 'info',
    content,
    icon: <InfoOutlined className='text-blue-500' />
  });
};

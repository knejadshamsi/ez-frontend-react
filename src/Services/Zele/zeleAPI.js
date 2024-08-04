import {useServiceStore} from '../../Stores'
import { Space , Modal, Input, Select , Tabs, Divider  } from 'antd';
const { Option, OptGroup } = Select;
const { TextArea } = Input;

export default function ZeleAPI() {
    const serviceState = useServiceStore((state) => state.activeService)
    const setActiveService = useServiceStore((state)=> state.setActiveService)

    return(
        <Modal
        open={serviceState==="ZELEAPI"}
        onCancel={()=> setActiveService("REST")}
        onClose={()=> setActiveService("REST")}
        width={800}
        >
            <Space direction="vertical">
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Form" key="1">
                        <Divider orientation="left">Choose Endpoint</Divider>
                        <Select showSearch style={{width: 200,}}>
                            <OptGroup label="GET">
                                <Option value="option1">Option 1</Option>
                                <Option value="option2">Option 2</Option>
                            </OptGroup>
                            <OptGroup label="POST">
                                <Option value="option3">Option 3</Option>
                                <Option value="option4">Option 4</Option>
                            </OptGroup>
                        </Select>
                        <Divider orientation="left">Parameters (Required)</Divider>
                        <Divider orientation="left">Parameters (Optional)</Divider>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="JSON" key="2"><Space direction="vertical"><Input placeholder="API endpoint" /><TextArea style={{width:500}} rows={10} placeholder="JSON goes here" /></Space></Tabs.TabPane>
                </Tabs>
            </Space>
        </Modal>
    )
}
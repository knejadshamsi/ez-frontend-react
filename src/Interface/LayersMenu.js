
import { Tree } from 'antd';

const treeData = [
  {
    title: 'Buildings',
    key: '0-0',
    children: [
      {
        title: '3D Models',
        key: '0-0-0',
      },
      {
        title: 'Footprints',
        key: '0-0-1',
      },
    ],
  },
  {
    title: 'Transport',
    key: '0-1',
    children: [
      {
        title: 'Metro Stations',
        key: '0-1-0',
      },
      {
        title: 'Road Collision',
        key: '0-1-1',
      },
    ],
  },
  {
    title: 'Energy',
    key: '0-2',
    children: [
      {
        title: 'EV Stations',
        key: '0-2-0',
      },
      {
        title: 'Gas Stations',
        key: '0-2-1',
      },
      {
        title: 'Power Grid',
        key: '0-2-2',
      },
      {
        title: 'Oil & Gas Installations',
        key: '0-2-3',
      },
    ],
  },
  {
    title: 'Waste',
    key: '0-3',
    children: [
      {
        title: 'Collection Zones',
        key: '0-3-0',
      },
      {
        title: 'Waste Sites',
        key: '0-3-1',
      },
    ],
  },
  {
    title: 'Ecosystem',
    key: '0-4',
    children: [
      {
        title: 'Public Trees',
        key: '0-4-0',
      },
    ],
  },
];


export default function LayersMenu() {
    return(
        <Tree
        showLine={true}
        treeData={treeData}
        defaultExpandAll
    />
    )

}
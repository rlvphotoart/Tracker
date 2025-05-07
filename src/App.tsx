import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  List,
  ListItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  IconButton,
  useToast,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CheckCircleIcon, EditIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

interface Task {
  id: number;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
}

const statusColor = {
  'todo': 'gray.400',
  'in-progress': 'brand.400',
  'completed': 'brand.500',
};

const statusIcon = {
  'todo': <TimeIcon />,
  'in-progress': <EditIcon />,
  'completed': <CheckCircleIcon />,
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useState(1);
  const toast = useToast();

  const addTask = () => {
    if (input.trim() === '') {
      toast({
        title: 'Task description required.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setTasks([...tasks, { id: nextId, description: input, status: 'todo' }]);
    setNextId(nextId + 1);
    setInput('');
  };

  const updateStatus = (id: number, status: Task['status']) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" bg="gray.50" boxShadow="md">
      <Heading mb={6} color="brand.500" textAlign="center" size="lg">
        Task Tracker
      </Heading>
      <Flex mb={4} gap={2}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
          bg="white"
        />
        <Button colorScheme="brand" onClick={addTask}>
          Add
        </Button>
      </Flex>
      <List spacing={3}>
        {tasks.map(task => (
          <ListItem
            key={task.id}
            p={4}
            borderWidth={1}
            borderRadius="md"
            bg="white"
            boxShadow="sm"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" align="center">
              <Tag
                size="md"
                colorScheme="brand"
                bg={statusColor[task.status]}
                color="white"
                borderRadius="full"
                px={3}
              >
                <TagLeftIcon boxSize="16px" as={() => statusIcon[task.status]} />
                <TagLabel textTransform="capitalize">{task.status.replace('-', ' ')}</TagLabel>
              </Tag>
              <Text
                as={task.status === 'completed' ? 's' : undefined}
                color={task.status === 'completed' ? 'gray.400' : 'gray.700'}
                fontWeight="medium"
                ml={2}
              >
                {task.description}
              </Text>
            </Stack>
            <Stack direction="row" gap={1}>
              {task.status !== 'in-progress' && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => updateStatus(task.id, 'in-progress')}
                >
                  In Progress
                </Button>
              )}
              {task.status !== 'completed' && (
                <Button
                  size="sm"
                  colorScheme="green"
                  variant="outline"
                  onClick={() => updateStatus(task.id, 'completed')}
                >
                  Complete
                </Button>
              )}
              <IconButton
                aria-label="Delete"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
              />
            </Stack>
          </ListItem>
        ))}
      </List>
      {tasks.length === 0 && (
        <Text mt={8} color="gray.400" textAlign="center">
          No tasks yet. Add your first task!
        </Text>
      )}
    </Box>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Heading, Input, List, ListItem, Stack, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Tag, TagLabel, TagLeftIcon, IconButton
} from '@chakra-ui/react';
import { CheckCircleIcon, DeleteIcon, TimeIcon } from '@chakra-ui/icons';

interface Task {
  id: number;
  description: string;
  startTime: string;
  endTime: string;
  status: 'todo' | 'in-progress' | 'completed';
  date: string; // YYYY-MM-DD
  completedAt?: string; // YYYY-MM-DD
  comment?: string;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const loadTasks = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
  } catch {
    return [];
  }
};

const saveTasks = (tasks: Task[]) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const App: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [comment, setComment] = useState('');
  const [nextId, setNextId] = useState(1);
  const toast = useToast();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
    setNextId(loaded.reduce((max, t) => Math.max(max, t.id), 0) + 1);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const today = getToday();

  const addTask = () => {
    if (input.trim() === '' || !startTime || !endTime) {
      toast({
        title: 'Please fill in all fields.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setTasks([
      ...tasks,
      {
        id: nextId,
        description: input,
        startTime,
        endTime,
        status: 'todo',
        date: today,
        comment,
      },
    ]);
    setNextId(nextId + 1);
    setInput('');
    setStartTime('');
    setEndTime('');
    setComment('');
  };

  const updateStatus = (id: number, status: Task['status']) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id
          ? {
              ...task,
              status,
              completedAt: status === 'completed' ? today : task.completedAt,
            }
          : task
      )
    );
  };

  const updateComment = (id: number, newComment: string) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, comment: newComment } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks => tasks.filter(task => task.id !== id));
  };

  // Filter tasks for today and for history
  const todayTasks = tasks.filter(task => task.date === today);
  const historyTasks = tasks
    .filter(task => task.status === 'completed' && task.completedAt && task.completedAt !== today)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1));

  // Group history tasks by date
  const historyByDate: { [date: string]: Task[] } = {};
  historyTasks.forEach(task => {
    if (!historyByDate[task.completedAt!]) historyByDate[task.completedAt!] = [];
    historyByDate[task.completedAt!].push(task);
  });

  return (
    <Box maxW="lg" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" bg="gray.50" boxShadow="md">
      <Heading mb={2} color="brand.500" textAlign="center" size="lg">
        Task Tracker
      </Heading>
      <Text textAlign="center" color="gray.600" mb={6} fontWeight="bold">
        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </Text>
      <Tabs index={tabIndex} onChange={setTabIndex} isFitted variant="enclosed">
        <TabList mb={4}>
          <Tab>Today</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanels>
          {/* Today Tab */}
          <TabPanel>
            <Flex mb={4} gap={2} flexWrap="wrap">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Task description"
                bg="white"
                flex={2}
              />
              <Input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                placeholder="Start"
                bg="white"
                flex={1}
              />
              <Input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                placeholder="End"
                bg="white"
                flex={1}
              />
              <Input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Comment (optional)"
                bg="white"
                flex={2}
              />
              <Button colorScheme="brand" onClick={addTask}>
                Add
              </Button>
            </Flex>
            <List spacing={3}>
              {todayTasks.length === 0 && (
                <Text color="gray.400" textAlign="center">
                  No tasks for today. Add your first task!
                </Text>
              )}
              {todayTasks.map(task => (
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
                  <Stack direction="row" align="center" spacing={4}>
                    <Tag
                      size="md"
                      colorScheme={task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'blue' : 'gray'}
                      borderRadius="full"
                      px={3}
                    >
                      <TagLeftIcon boxSize="16px" as={task.status === 'completed' ? CheckCircleIcon : TimeIcon} />
                      <TagLabel textTransform="capitalize">{task.status.replace('-', ' ')}</TagLabel>
                    </Tag>
                    <Stack>
                      <Text
                        as={task.status === 'completed' ? 's' : undefined}
                        color={task.status === 'completed' ? 'gray.400' : 'gray.700'}
                        fontWeight="medium"
                      >
                        {task.description}
                      </Text>
                      {task.status === 'in-progress' ? (
                        <Input
                          value={task.comment || ''}
                          onChange={e => updateComment(task.id, e.target.value)}
                          placeholder="Add a comment"
                          size="sm"
                          width="200px"
                          bg="gray.50"
                          mt={1}
                        />
                      ) : (
                        task.comment && (
                          <Text color="gray.500" fontSize="sm" mt={1}>
                            {task.comment}
                          </Text>
                        )
                      )}
                    </Stack>
                    <Text color="brand.400" fontSize="sm">
                      {task.startTime} - {task.endTime}
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
          </TabPanel>
          {/* History Tab */}
          <TabPanel>
            {Object.keys(historyByDate).length === 0 && (
              <Text color="gray.400" textAlign="center">
                No completed tasks from previous days.
              </Text>
            )}
            {Object.entries(historyByDate).map(([date, tasks]) => (
              <Box key={date} mb={6}>
                <Text fontWeight="bold" color="brand.500" mb={2}>
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
                <List spacing={2}>
                  {tasks.map(task => (
                    <ListItem
                      key={task.id}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" align="center" spacing={4}>
                        <Tag
                          size="md"
                          colorScheme="green"
                          borderRadius="full"
                          px={3}
                        >
                          <TagLeftIcon boxSize="16px" as={CheckCircleIcon} />
                          <TagLabel>Completed</TagLabel>
                        </Tag>
                        <Stack>
                          <Text as="s" color="gray.500" fontWeight="medium">
                            {task.description}
                          </Text>
                          {task.comment && (
                            <Text color="gray.500" fontSize="sm" mt={1}>
                              {task.comment}
                            </Text>
                          )}
                        </Stack>
                        <Text color="brand.400" fontSize="sm">
                          {task.startTime} - {task.endTime}
                        </Text>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default App;
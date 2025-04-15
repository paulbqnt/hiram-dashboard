import React, { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Group,
    Paper,
    Button,
    Box,
    SimpleGrid,
    Transition,
    useMantineTheme,
    Stack
} from '@mantine/core';
import { useRouter } from '@tanstack/react-router';
import {
    IconCalculator,
    IconChartLine,
    IconBriefcase,
    IconArrowRight,
    IconPlayerPlay,
    IconPlayerPause
} from '@tabler/icons-react';
import { useHover } from '@mantine/hooks';

// Feature card interface
interface FeatureCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    videoUrl: string;
    thumbnailUrl: string;
    path: string;
}

// Feature card component with video
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, videoUrl, thumbnailUrl, path }) => {
    const router = useRouter();
    const { hovered, ref } = useHover();
    const theme = useMantineTheme();
    const [isPlaying, setIsPlaying] = useState(false);

    // Handle card click with explicit function
    const handleCardClick = (event: React.MouseEvent) => {
        event.preventDefault();
        router.navigate({ to: path });
    };

    // Handle video play/pause
    const togglePlayPause = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card click

        const video = document.getElementById(`video-${title}`) as HTMLVideoElement;
        if (video) {
            if (video.paused) {
                video.play();
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        }
    };

    return (
        <Paper
            ref={ref}
            shadow="md"
            radius="md"
            p={0}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: 340,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: hovered ? 'translateY(-5px)' : 'none',
                boxShadow: hovered ? theme.shadows.lg : theme.shadows.md,
                cursor: 'pointer'
            }}
            onClick={handleCardClick}
        >
            {/* Video container */}
            <Box sx={{ position: 'relative', height: 240 }}>
                <video
                    id={`video-${title}`}
                    poster={thumbnailUrl}
                    style={{
                        width: '100%',
                        height: '240px',
                        objectFit: 'cover'
                    }}
                    muted
                    loop
                    playsInline
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Play/Pause button overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.2s ease'
                    }}
                    onClick={togglePlayPause}
                >
                    <ThemeIcon
                        size="xl"
                        radius="xl"
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                    >
                        {isPlaying ? <IconPlayerPause size={24} /> : <IconPlayerPlay size={24} />}
                    </ThemeIcon>
                </Box>
            </Box>

            {/* Content box with white background */}
            <Box
                sx={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.white
                }}
            >
                <Group position="apart" mb={5}>
                    <Group spacing="xs">
                        {icon}
                        <Title order={4}>{title}</Title>
                    </Group>

                    <Transition mounted={hovered} transition="fade" duration={200}>
                        {(styles) => (
                            <Button
                                rightIcon={<IconArrowRight size={16} />}
                                variant="subtle"
                                compact
                                style={styles}
                            >
                                Explore
                            </Button>
                        )}
                    </Transition>
                </Group>
                <Text size="sm" color="dimmed" lineClamp={2}>
                    {description}
                </Text>
            </Box>
        </Paper>
    );
};

// Define a ThemeIcon component since Mantine's is imported and used
const ThemeIcon: React.FC<{
    size: string;
    radius: string;
    sx: any;
    children: React.ReactNode;
}> = ({ size, radius, sx, children }) => {
    const theme = useMantineTheme();

    const sizeMap: Record<string, string> = {
        xs: '16px',
        sm: '24px',
        md: '36px',
        lg: '48px',
        xl: '64px'
    };

    const actualSize = sizeMap[size] || size;

    return (
        <Box
            sx={{
                width: actualSize,
                height: actualSize,
                borderRadius: radius === 'xl' ? '50%' : theme.radius[radius] || radius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...sx
            }}
        >
            {children}
        </Box>
    );
};

// Featured tool data with videos
const featuredTools = [
    {
        title: 'Pricer',
        description: 'Advanced option pricing calculator powered by Hiram. Calculate and visualize option prices across various parameters.',
        icon: <IconCalculator size={20} />,
        videoUrl: '/path-to-pricer-demo.mp4', // Replace with actual video
        thumbnailUrl: '/api/placeholder/600/400', // Replace with actual thumbnail
        path: '/pricer'
    },
    {
        title: 'Stock',
        description: 'Interactive stock analysis tool with real-time charts, technical indicators, and historical data visualization.',
        icon: <IconChartLine size={20} />,
        videoUrl: '/path-to-stock-demo.mp4', // Replace with actual video
        thumbnailUrl: '/api/placeholder/600/400', // Replace with actual thumbnail
        path: '/stock'
    },
    {
        title: 'Portfolio',
        description: 'Track and analyze your investment portfolio with performance metrics, risk assessment, and optimization tools.',
        icon: <IconBriefcase size={20} />,
        videoUrl: '/path-to-portfolio-demo.mp4', // Replace with actual video
        thumbnailUrl: '/api/placeholder/600/400', // Replace with actual thumbnail
        path: '/portfolio'
    }
];

const Home: React.FC = () => {
    const router = useRouter();

    // Explicit handlers
    const navigateToAbout = () => {
        router.navigate({ to: '/about' });
    };

    const navigateToPricer = () => {
        router.navigate({ to: '/pricer' });
    };

    return (
        <Container size="xl" py={40}>
            <Stack spacing={50}>
                {/* Hero Section */}
                <Box mb={20}>
                    <Title order={1} mb={10} align="center" size="h1">
                        Financial Tools Dashboard
                    </Title>
                    <Text size="lg" align="center" color="dimmed" mb={30}>
                        Discover tools for options pricing, stock analysis, and portfolio management
                    </Text>
                </Box>

                {/* Featured Tools Grid */}
                <SimpleGrid
                    cols={3}
                    spacing="lg"
                    breakpoints={[
                        { maxWidth: theme => theme.breakpoints.md, cols: 2, spacing: 'md' },
                        { maxWidth: theme => theme.breakpoints.sm, cols: 1, spacing: 'sm' }
                    ]}
                >
                    {featuredTools.map((tool, index) => (
                        <FeatureCard key={index} {...tool} />
                    ))}
                </SimpleGrid>

                {/* Call to Action */}
                <Paper
                    shadow="sm"
                    p="xl"
                    radius="md"
                    withBorder
                    sx={(theme) => ({
                        backgroundColor: theme.colors.blue[0],
                        borderColor: theme.colors.blue[3]
                    })}
                >
                    <Group position="apart" align="center">
                        <Box>
                            <Title order={3} mb={5}>Ready to get started?</Title>
                            <Text>Explore the tools or learn more about the project.</Text>
                        </Box>
                        <Group>
                            <Button
                                variant="outline"
                                color="blue"
                                onClick={navigateToAbout}
                            >
                                About Project
                            </Button>
                            <Button
                                color="blue"
                                onClick={navigateToPricer}
                            >
                                Get Started
                            </Button>
                        </Group>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
};

export default Home;
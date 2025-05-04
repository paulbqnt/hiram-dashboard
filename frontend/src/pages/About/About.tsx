import React from 'react';
import {
    Container,
    Title,
    Text,
    Box,
    Group,
    Button,
    Stack,
    Divider,
    Anchor,
    ThemeIcon
} from "@mantine/core";
import {
    IconDownload,
    IconBrandLinkedin,
    IconBrandGithub,
    IconMessage
} from '@tabler/icons-react';

const About: React.FC = () => {
    // Function to handle resume download
    const handleDownloadResume = () => {
        // Replace this URL with the actual path to your resume file
        const resumeUrl = '/path-to-your-resume.pdf';

        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.download = 'Paul_Boquant_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container size="lg" py={40}>
            <Box mb={30}>
                <Title order={1} mb={20} size="h1">Hey, I'm Paul Boquant</Title>

                <Text size="xl" mb={30}>
                    I build financial tools. This dashboard showcases
                    <Anchor href="https://github.com/paulbqnt/hiram-pricing" target="_blank" weight={700}> Hiram</Anchor>,
                    my option pricing library that makes option pricing simple.
                </Text>

                <Text size="lg" mb={40}>
                    Looking for efficient financial tools or applications? Let's talk.
                </Text>

                <Divider my={30} />

                <Group position="center" spacing="md" grow mt={20}>
                    <Button
                        leftIcon={<IconMessage size={20} />}
                        size="lg"
                        color="blue"
                        variant="filled"
                        component="a"
                        href="mailto:pbqnt@protonmail.com"
                    >
                        Let's Work Together
                    </Button>


                </Group>

                <Group position="center" spacing="md" mt={15}>
                    <Button
                        component="a"
                        href="https://www.linkedin.com/in/paulboquant/"
                        target="_blank"
                        rel="noopener noreferrer"
                        leftIcon={<IconBrandLinkedin size={18} />}
                        variant="subtle"
                        color="gray"
                    >
                        LinkedIn
                    </Button>

                    <Button
                        component="a"
                        href="https://github.com/paulbqnt"
                        target="_blank"
                        rel="noopener noreferrer"
                        leftIcon={<IconBrandGithub size={18} />}
                        variant="subtle"
                        color="dark"
                    >
                        GitHub
                    </Button>
                </Group>
            </Box>
        </Container>
    );
};

export default About;
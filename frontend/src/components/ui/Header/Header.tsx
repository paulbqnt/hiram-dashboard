import { useState } from 'react';
import { Burger, Container, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import classes from './Header.module.css';

const links = [
    { link: '/', label: 'Home' },
    { link: '/pricer', label: 'Pricer' },
    { link: '/stock', label: 'Stock' },
    { link: '/portfolio', label: 'Portfolio' },
    { link: '/about', label: 'About' },
];

export function Header() {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);

    const items = links.map((link) => (
        <Link
            key={link.label}
            to={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={() => {
                setActive(link.link);
            }}
        >
            {link.label}
        </Link>
    ));

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Text component="h4" className={classes.logo}>
                    Dashboard
                </Text>

                <Group gap={5} className={classes.links} visibleFrom="xs">
                    {items}
                </Group>

                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}
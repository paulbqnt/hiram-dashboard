import React from 'react';
import {
    Anchor,
    Button,
    Checkbox, ComboboxItem,
    Container,
    Group,
    NumberInput, OptionsFilter,
    Paper,
    PasswordInput,
    Select,
    TextInput
} from "@mantine/core";

const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ');
    return (options as ComboboxItem[]).filter((option) => {
        const words = option.label.toLowerCase().trim().split(' ');
        return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
    });
};



const Stock: React.FC = () => {
  return (
    <div>
        <Container>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Select
                    label="Your country"
                    placeholder="Pick value"
                    data={['Great Britain', 'Russian Federation', 'United States']}
                    filter={optionsFilter}
                    searchable
                />



                <Button fullWidth mt="xl">
                    Sign in
                </Button>
            </Paper>
        </Container>

    </div>
  );
}

export default Stock;
const getCsfExport = (component, title, readme, options = {}) => ({
    component,
    title,
    parameters: {
        docs: {
            description: { component: readme },
        },
        options: {
            showPanel: true,
            ...options
        },
    },
});

export default getCsfExport;

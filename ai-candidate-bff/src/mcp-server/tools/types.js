class Tool {
  constructor(name, description, schema, executor) {
    this.name = name;
    this.description = description;
    this.schema = schema;
    this.executor = executor;
  }

  bind(server) {
    return server.tool(
      this.name,
      this.description,
      this.schema,
      this.executor,
    );
  }
}

module.exports = { Tool }; 
I/O Classification

Type Description / Use Case Template Fields

Function arguments Data passed directly to the function inputs: name, type, constraints

Return values Data returned by the function outputs: name, type, constraints

Console I/O User input or print/log output io_console: read/write description

Files Read/write files (CSV, JSON, etc.) io_file: path, format, read/write

Database Read/write structured data io_db: db_type, table, query type, read/write

API / Network HTTP requests or other protocols io_api: endpoint, method, request/response


Calendar Overlay App has a JSON config file.
The file contains:
course code 1
    sprint1, startweek (int), endweek (int)
    sprint2, startweek (int), endweek (int)
    sprint3, startweek (int), endweek (int)
    exam, date
    assessment, date

course code 2
    sprint1, startweek (int), endweek (int)
    sprint2, startweek (int), endweek (int)
    sprint3, startweek (int), endweek (int)
    exam, date
    assessment, date


Template Integration Example

# INPUTS:

#   - arr: list of integers (function argument)
#   - config_file: path to JSON (file input)
#   - db_conn: connection string (database input)

# OUTPUTS:

#   - sorted_arr: list of integers (return value)
#   - log: printed to console
#   - results_table: written to database table 'sorted_results'


Notes for LLM guidance:

• Make each I/O type explicit.
• Include format, constraints, and direction (read/write).
• For databases, specify table names, queries, and type of database.
• For files, specify format and expected structure.

This way, your pseudo code + LLM instructions clearly define where the data comes from and goes, making the generated code more reliable.

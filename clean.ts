/** clean the project directory */

const delete_dir_list: string[] = [
	"./npm/",
	"./docs/",
	/*
	"./backup",
	*/
]

const delete_file_list: string[] = [
	/*
	"./deno.lock",
	*/
]

for (const dir_path of delete_dir_list) Deno.removeSync(dir_path, { recursive: true })
for (const file_path of delete_file_list) Deno.removeSync(file_path, { recursive: true })

"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface ReportTableProps {
  type: "financial" | "operational" | "users"
}

export function ReportTable({ type }: ReportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState(() => {
    if (type === "financial") {
      return [
        {
          id: "INV-001",
          cliente: "João Silva",
          servico: "Limpeza Residencial",
          data: "10/05/2023",
          valor: "R$ 280,00",
          status: "Pago",
        },
        {
          id: "INV-002",
          cliente: "Maria Oliveira",
          servico: "Limpeza Comercial",
          data: "12/05/2023",
          valor: "R$ 450,00",
          status: "Pago",
        },
        {
          id: "INV-003",
          cliente: "Carlos Santos",
          servico: "Limpeza Pós-obra",
          data: "15/05/2023",
          valor: "R$ 620,00",
          status: "Pendente",
        },
        {
          id: "INV-004",
          cliente: "Ana Pereira",
          servico: "Limpeza de Vidros",
          data: "18/05/2023",
          valor: "R$ 180,00",
          status: "Pago",
        },
        {
          id: "INV-005",
          cliente: "Roberto Almeida",
          servico: "Limpeza Residencial",
          data: "20/05/2023",
          valor: "R$ 320,00",
          status: "Cancelado",
        },
      ]
    } else if (type === "operational") {
      return [
        {
          id: "PRO-001",
          nome: "Amanda Silva",
          servicos: 42,
          avaliacao: "4.9",
          pontualidade: "98%",
          eficiencia: "95%",
        },
        {
          id: "PRO-002",
          nome: "Ricardo Oliveira",
          servicos: 38,
          avaliacao: "4.7",
          pontualidade: "96%",
          eficiencia: "92%",
        },
        {
          id: "PRO-003",
          nome: "Juliana Santos",
          servicos: 45,
          avaliacao: "4.8",
          pontualidade: "97%",
          eficiencia: "94%",
        },
        {
          id: "PRO-004",
          nome: "Marcos Pereira",
          servicos: 32,
          avaliacao: "4.6",
          pontualidade: "95%",
          eficiencia: "90%",
        },
        {
          id: "PRO-005",
          nome: "Carla Almeida",
          servicos: 40,
          avaliacao: "4.9",
          pontualidade: "99%",
          eficiencia: "96%",
        },
      ]
    } else {
      return [
        {
          id: "USR-001",
          nome: "João Silva",
          email: "joao.silva@email.com",
          ultimoAcesso: "Hoje, 10:23",
          status: "Online",
          atividade: "Agendamento",
        },
        {
          id: "USR-002",
          nome: "Maria Oliveira",
          email: "maria.oliveira@email.com",
          ultimoAcesso: "Hoje, 09:15",
          status: "Offline",
          atividade: "Avaliação",
        },
        {
          id: "USR-003",
          nome: "Carlos Santos",
          email: "carlos.santos@email.com",
          ultimoAcesso: "Ontem, 18:42",
          status: "Offline",
          atividade: "Pagamento",
        },
        {
          id: "USR-004",
          nome: "Ana Pereira",
          email: "ana.pereira@email.com",
          ultimoAcesso: "Hoje, 11:05",
          status: "Online",
          atividade: "Agendamento",
        },
        {
          id: "USR-005",
          nome: "Roberto Almeida",
          email: "roberto.almeida@email.com",
          ultimoAcesso: "Hoje, 08:30",
          status: "Offline",
          atividade: "Cancelamento",
        },
      ]
    }
  })

  let columns: ColumnDef<any>[] = []

  if (type === "financial") {
    columns = [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "cliente",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Cliente
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "servico",
        header: "Serviço",
      },
      {
        accessorKey: "data",
        header: "Data",
      },
      {
        accessorKey: "valor",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Valor
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge variant={status === "Pago" ? "success" : status === "Pendente" ? "warning" : "destructive"}>
              {status}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Enviar por email</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  } else if (type === "operational") {
    columns = [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "servicos",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Serviços
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "avaliacao",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Avaliação
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "pontualidade",
        header: "Pontualidade",
      },
      {
        accessorKey: "eficiencia",
        header: "Eficiência",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                <DropdownMenuItem>Ver histórico</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Exportar dados</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  } else {
    columns = [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
      },
      {
        accessorKey: "nome",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "ultimoAcesso",
        header: "Último Acesso",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return <Badge variant={status === "Online" ? "success" : "secondary"}>{status}</Badge>
        },
      },
      {
        accessorKey: "atividade",
        header: "Última Atividade",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                <DropdownMenuItem>Enviar mensagem</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ver histórico</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ]
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={`Pesquisar ${type === "financial" ? "transações" : type === "operational" ? "profissionais" : "usuários"}...`}
          value={(table.getColumn(type === "financial" ? "cliente" : "nome")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(type === "financial" ? "cliente" : "nome")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "id" ? "ID" : column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando <span className="font-medium">{table.getRowModel().rows.length}</span> de{" "}
          <span className="font-medium">{data.length}</span> registros.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 border-b-2 border-border pb-2 font-mono text-lg font-bold uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex flex-wrap gap-6">{children}</div>
    </section>
  );
}

function ExampleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex w-72 flex-col gap-3 rounded-none border-2 border-border p-4">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      {children}
    </div>
  );
}

export default function ComponentsPage() {
  const [checked, setChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState([40]);
  const [progressValue] = useState(65);
  const [switchOn, setSwitchOn] = useState(false);
  const [page, setPage] = useState(3);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");

  return (
    <TooltipProvider>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <p className="mb-1 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Design System
          </p>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight">Components</h1>
        </div>

        <Section title="Form Controls">
          <ExampleCard title="Button">
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </ExampleCard>

          <ExampleCard title="Input">
            <Input placeholder="Enter text..." />
          </ExampleCard>

          <ExampleCard title="Select">
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  <SelectItem value="option-1">Option 1</SelectItem>
                  <SelectItem value="option-2">Option 2</SelectItem>
                  <SelectItem value="option-3">Option 3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </ExampleCard>

          <ExampleCard title="Checkbox">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
              <label htmlFor="terms" className="font-mono text-sm cursor-pointer">
                Accept terms
              </label>
            </div>
          </ExampleCard>

          <ExampleCard title="Radio Group">
            <RadioGroup defaultValue="option-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-1" id="r1" />
                <label htmlFor="r1" className="font-mono text-sm">
                  Option 1
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-2" id="r2" />
                <label htmlFor="r2" className="font-mono text-sm">
                  Option 2
                </label>
              </div>
            </RadioGroup>
          </ExampleCard>

          <ExampleCard title="Switch">
            <div className="flex items-center gap-3">
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
              <span className="font-mono text-sm">{switchOn ? "ON" : "OFF"}</span>
            </div>
          </ExampleCard>

          <ExampleCard title="Slider">
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
            <span className="font-mono text-sm text-muted-foreground">{sliderValue}</span>
          </ExampleCard>

          <ExampleCard title="Progress">
            <Progress value={progressValue} />
            <span className="font-mono text-sm text-muted-foreground">{progressValue}%</span>
          </ExampleCard>
        </Section>

        <Section title="Layout & Navigation">
          <ExampleCard title="Tabs">
            <Tabs defaultValue="tab-1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab-3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab-1">
                <p className="font-mono text-sm text-muted-foreground">Content for tab 1</p>
              </TabsContent>
              <TabsContent value="tab-2">
                <p className="font-mono text-sm text-muted-foreground">Content for tab 2</p>
              </TabsContent>
              <TabsContent value="tab-3">
                <p className="font-mono text-sm text-muted-foreground">Content for tab 3</p>
              </TabsContent>
            </Tabs>
          </ExampleCard>

          <ExampleCard title="Accordion">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Item 1</AccordionTrigger>
                <AccordionContent>Content for item 1</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Item 2</AccordionTrigger>
                <AccordionContent>Content for item 2</AccordionContent>
              </AccordionItem>
            </Accordion>
          </ExampleCard>

          <ExampleCard title="Separator">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-sm">Section A</span>
              <Separator />
              <span className="font-mono text-sm">Section B</span>
            </div>
          </ExampleCard>

          <ExampleCard title="Sheet">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet Title</SheetTitle>
                  <SheetDescription>This is a sheet component.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </ExampleCard>

          <ExampleCard title="Dropdown Menu">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Item 1</DropdownMenuItem>
                <DropdownMenuItem>Item 2</DropdownMenuItem>
                <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
                  Checkbox Item
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ExampleCard>

          <ExampleCard title="Pagination">
            <Pagination page={page} pageCount={10} onPageChange={setPage} />
          </ExampleCard>
        </Section>

        <Section title="Display">
          <ExampleCard title="Avatar">
            <div className="flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-muted text-muted-foreground">JD</AvatarFallback>
              </Avatar>
            </div>
          </ExampleCard>

          <ExampleCard title="Badge">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="muted">Muted</Badge>
            </div>
          </ExampleCard>

          <ExampleCard title="Alert">
            <Alert variant="default">
              <AlertTitle>Default</AlertTitle>
              <AlertDescription>This is a default alert.</AlertDescription>
            </Alert>
          </ExampleCard>

          <ExampleCard title="Alert (Destructive)">
            <Alert variant="destructive">
              <AlertTitle>Destructive</AlertTitle>
              <AlertDescription>This is a destructive alert.</AlertDescription>
            </Alert>
          </ExampleCard>

          <ExampleCard title="Alert (Success)">
            <Alert variant="success">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Operation completed successfully.</AlertDescription>
            </Alert>
          </ExampleCard>

          <ExampleCard title="Card">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm">Card content goes here.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
          </ExampleCard>

          <ExampleCard title="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="font-mono text-sm">Popover content</p>
              </PopoverContent>
            </Popover>
          </ExampleCard>

          <ExampleCard title="Hover Card">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline">Hover Me</Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="font-mono text-sm">This appears on hover.</p>
              </HoverCardContent>
            </HoverCard>
          </ExampleCard>

          <ExampleCard title="Skeleton">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </ExampleCard>

          <ExampleCard title="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">Tooltip content</p>
              </TooltipContent>
            </Tooltip>
          </ExampleCard>
        </Section>

        <Section title="Advanced">
          <ExampleCard title="Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>Dialog description goes here.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </ExampleCard>

          <ExampleCard title="Command">
            <Button variant="outline" onClick={() => setCommandOpen(true)}>
              Open Command
            </Button>
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
              <CommandInput placeholder="Type a command..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Actions">
                  <CommandItem>Create new project</CommandItem>
                  <CommandItem>Open settings</CommandItem>
                  <CommandItem>Delete item</CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </ExampleCard>
        </Section>
      </div>
    </TooltipProvider>
  );
}

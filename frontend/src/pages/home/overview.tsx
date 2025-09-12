import { Page, Section } from "@components/layouts";
import { ResourceComponents } from "@components/resources";
import { StatusBadge } from "@components/util";
import { TagsFilter, TagsWithBadge } from "@components/tags";
import {
  container_state_intention,
  deployment_state_intention,
  stack_state_intention,
  stroke_color_class_by_intention,
} from "@lib/color";
import { useFilterResources, useRead, useTagsFilter } from "@lib/hooks";
import { cn } from "@lib/utils";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import {
  ChevronDown,
  ChevronRight,
  Container,
  Layers,
  Layers2,
  Server,
  Box,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Overview() {
  const [search, setSearch] = useState("");
  const [expandedServers, setExpandedServers] = useState<Set<string>>(
    new Set()
  );
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(
    new Set()
  );
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );

  const tags = useTagsFilter();
  const servers = useRead("ListServers", { query: { tags } }).data;
  const stacks = useRead("ListStacks", {}).data;
  const deployments = useRead("ListDeployments", {}).data;

  const toggleServer = (serverId: string) => {
    setExpandedServers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serverId)) {
        newSet.delete(serverId);
      } else {
        newSet.add(serverId);
      }
      return newSet;
    });
  };

  const toggleStack = (stackId: string) => {
    setExpandedStacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stackId)) {
        newSet.delete(stackId);
      } else {
        newSet.add(stackId);
      }
      return newSet;
    });
  };

  const toggleService = (serviceId: string) => {
    setExpandedServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const filteredServers = useFilterResources(servers, search);

  return (
    <Page
      titleOther={
        <div className="flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="search..."
              className="w-[200px] lg:w-[300px]"
            />
          </div>
          <TagsFilter />
        </div>
      }
    >
      <Section>
        <div className="grid gap-2">
          {filteredServers?.map((server) => (
            <div key={server.id} className="grid gap-2">
              <ServerRow
                server={server}
                isExpanded={expandedServers.has(server.id)}
                onToggle={() => toggleServer(server.id)}
                stacks={stacks}
                deployments={deployments}
                expandedStacks={expandedStacks}
                toggleStack={toggleStack}
                expandedServices={expandedServices}
                toggleService={toggleService}
                search={search}
              />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

const ServerRow = ({
  server,
  isExpanded,
  onToggle,
  stacks,
  deployments,
  expandedStacks,
  toggleStack,
  expandedServices,
  toggleService,
  search,
}: {
  server: any;
  isExpanded: boolean;
  onToggle: () => void;
  stacks?: any[];
  deployments?: any[];
  expandedStacks: Set<string>;
  toggleStack: (stackId: string) => void;
  expandedServices: Set<string>;
  toggleService: (serviceId: string) => void;
  search: string;
}) => {
  const serverStacks = stacks?.filter(
    (stack) => stack.info.server_id === server.id
  );
  const serverDeployments = deployments?.filter(
    (deployment) => deployment.info.server_id === server.id
  );

  const filteredStacks = useFilterResources(serverStacks, search);
  const filteredDeployments = useFilterResources(serverDeployments, search);

  const hasContent =
    (filteredStacks && filteredStacks.length > 0) ||
    (filteredDeployments && filteredDeployments.length > 0);

  return (
    <>
      <Card className="hover:bg-accent/30 transition-colors">
        <CardHeader
          className="p-4 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {hasContent &&
                (isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                ))}
              {!hasContent && <div className="w-4" />}
              <Server className="w-4 h-4" />
              <CardTitle className="text-lg">{server.name}</CardTitle>
            </div>
            <div className="flex gap-3 items-center">
              <TagsWithBadge tag_ids={server.tags} />
              <Link to={`/servers/${server.id}`} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm">
                  <ResourceComponents.Server.Icon id={server.id} />
                  <span className="ml-2">View</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isExpanded && hasContent && (
        <div className="ml-6 grid gap-2">
          {filteredStacks?.map((stack) => (
            <StackRow
              key={stack.id}
              stack={stack}
              isExpanded={expandedStacks.has(stack.id)}
              onToggle={() => toggleStack(stack.id)}
              expandedServices={expandedServices}
              toggleService={toggleService}
              search={search}
            />
          ))}
          {filteredDeployments?.map((deployment) => (
            <DeploymentRow key={deployment.id} deployment={deployment} />
          ))}
        </div>
      )}
    </>
  );
};

const StackRow = ({
  stack,
  isExpanded,
  onToggle,
  expandedServices,
  toggleService,
  search,
}: {
  stack: any;
  isExpanded: boolean;
  onToggle: () => void;
  expandedServices: Set<string>;
  toggleService: (serviceId: string) => void;
  search: string;
}) => {
  const services = useRead(
    "ListStackServices",
    { stack: stack.id },
    { enabled: isExpanded, refetchInterval: isExpanded ? 10_000 : undefined }
  ).data;

  const filteredServices = services?.filter(
    (service) =>
      !search ||
      service.service.toLowerCase().includes(search.toLowerCase()) ||
      service.container?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const hasServices = filteredServices && filteredServices.length > 0;

  const color = stroke_color_class_by_intention(
    stack_state_intention(stack.info.state)
  );

  return (
    <>
      <Card className="hover:bg-accent/20 transition-colors">
        <CardHeader
          className="p-3 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {hasServices &&
                (isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                ))}
              {!hasServices && <div className="w-4" />}
              <Layers className={cn("w-4 h-4", color)} />
              <span className="font-medium">{stack.name}</span>
              <StatusBadge
                text={stack.info.state}
                intent={stack_state_intention(stack.info.state)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <TagsWithBadge tag_ids={stack.tags} />
              <Link to={`/stacks/${stack.id}`} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isExpanded && hasServices && (
        <div className="ml-6 grid gap-1">
          {filteredServices?.map((service) => (
            <ServiceRow 
              key={service.service} 
              service={service} 
              stackId={stack.id}
              isExpanded={expandedServices.has(`${stack.id}-${service.service}`)}
              onToggle={() => toggleService(`${stack.id}-${service.service}`)}
            />
          ))}
        </div>
      )}
    </>
  );
};

const DeploymentRow = ({
  deployment,
}: {
  deployment: any;
}) => {
  const color = stroke_color_class_by_intention(
    deployment_state_intention(deployment.info.state)
  );

  return (
    <Card className="hover:bg-accent/20 transition-colors">
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4" />
            <Container className={cn("w-4 h-4", color)} />
            <span className="font-medium">{deployment.name}</span>
            <StatusBadge
              text={deployment.info.state}
              intent={deployment_state_intention(deployment.info.state)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <TagsWithBadge tag_ids={deployment.tags} />
            <Link to={`/deployments/${deployment.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

const ServiceRow = ({
  service,
  stackId,
  isExpanded,
  onToggle,
}: {
  service: any;
  stackId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const color = stroke_color_class_by_intention(
    container_state_intention(service.container?.state)
  );

  const hasContainer = service.container;

  return (
    <>
      <Card className="hover:bg-accent/10 transition-colors">
        <CardContent className="p-2">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={hasContainer ? onToggle : undefined}
          >
            <div className="flex items-center gap-2">
              {hasContainer &&
                (isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ))}
              {!hasContainer && <div className="w-3" />}
              <Layers2 className={cn("w-3 h-3", color)} />
              <span className="text-sm">{service.service}</span>
              {service.container && (
                <StatusBadge
                  text={service.container.state}
                  intent={container_state_intention(service.container.state)}
                />
              )}
            </div>
            <Link
              to={`/stacks/${stackId}/service/${service.service}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {isExpanded && hasContainer && (
        <div className="ml-6">
          <ContainerRow container={service.container} />
        </div>
      )}
    </>
  );
};

const ContainerRow = ({
  container,
}: {
  container: any;
}) => {
  const color = stroke_color_class_by_intention(
    container_state_intention(container.state)
  );

  return (
    <Card className="hover:bg-accent/5 transition-colors">
      <CardContent className="p-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3" />
            <Box className={cn("w-3 h-3", color)} />
            <span className="text-xs font-mono">{container.name}</span>
            <StatusBadge
              text={container.state}
              intent={container_state_intention(container.state)}
            />
          </div>
          <div className="flex items-center gap-2">
            {container.network?.ports && container.network.ports.length > 0 && (
              <div className="flex gap-1">
                {container.network.ports.slice(0, 3).map((port: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs bg-muted px-2 py-1 rounded font-mono"
                  >
                    {port.host_port ? `${port.host_port}:` : ''}{port.container_port}
                    {port.protocol !== 'tcp' ? `/${port.protocol}` : ''}
                  </span>
                ))}
                {container.network.ports.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{container.network.ports.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
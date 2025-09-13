import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge, 
  StatusBadge, 
  PriorityBadge,
  EmptyState,
  ErrorState,
  LoadingState
} from '../components/ui';
import { Plus } from 'lucide-react';

const DesignSystemDemo: React.FC = () => {
  const [currentState, setCurrentState] = useState<'loaded' | 'loading' | 'empty' | 'error'>('loaded');

  const renderStateDemo = () => {
    switch (currentState) {
      case 'loading':
        return <LoadingState message="Chargement des données..." className="min-h-[400px]" />;
      case 'empty':
        return (
          <EmptyState
            title="Aucune donnée disponible"
            description="Il n'y a actuellement aucun élément à afficher. Commencez par ajouter votre premier élément."
            action={{
              label: 'Ajouter un élément',
              onClick: () => setCurrentState('loaded')
            }}
          />
        );
      case 'error':
        return (
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de charger les données. Veuillez réessayer."
            onRetry={() => setCurrentState('loaded')}
            onGoHome={() => setCurrentState('loaded')}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Données chargées avec succès</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600">
                  Toutes les données ont été chargées correctement. Vous pouvez maintenant naviguer et interagir avec l'interface.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-8">
      {/* En-tête avec titre */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Design System Demo
        </h1>
        <p className="text-secondary-600 mt-2">
          Démonstration des composants et états du système de design
        </p>
      </div>

      {/* Section Boutons */}
      <Card>
        <CardHeader>
          <CardTitle>Composants Boutons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={<Plus size={16} />}>
              Primary
            </Button>
            <Button variant="secondary">
              Secondary
            </Button>
            <Button variant="outline">
              Outline
            </Button>
            <Button variant="ghost">
              Ghost
            </Button>
            <Button variant="danger">
              Danger
            </Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges et Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success" dot>Success</Badge>
              <Badge variant="warning" dot>Warning</Badge>
              <Badge variant="error" dot>Error</Badge>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
              <StatusBadge status="completed" />
              <StatusBadge status="failed" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <PriorityBadge priority="low" />
              <PriorityBadge priority="medium" />
              <PriorityBadge priority="high" />
              <PriorityBadge priority="urgent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Contrôles d'États */}
      <Card>
        <CardHeader>
          <CardTitle>Test des États</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Button 
              variant={currentState === 'loaded' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setCurrentState('loaded')}
            >
              Données chargées
            </Button>
            <Button 
              variant={currentState === 'loading' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setCurrentState('loading')}
            >
              État de chargement
            </Button>
            <Button 
              variant={currentState === 'empty' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setCurrentState('empty')}
            >
              État vide
            </Button>
            <Button 
              variant={currentState === 'error' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setCurrentState('error')}
            >
              État d'erreur
            </Button>
          </div>
          
          <div className="border border-secondary-200 rounded-lg min-h-[300px]">
            {renderStateDemo()}
          </div>
        </CardContent>
      </Card>

      {/* Section Variants de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Card Default</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-600">Variant par défaut avec bordure simple.</p>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Card Bordered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-600">Variant avec bordure rouge épaisse.</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Card Elevated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-600">Variant avec ombre pour effet de relief.</p>
          </CardContent>
        </Card>

        <Card variant="interactive">
          <CardHeader>
            <CardTitle>Card Interactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-600">Variant interactif avec effets hover.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo;

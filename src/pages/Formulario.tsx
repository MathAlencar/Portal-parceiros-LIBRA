
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/auth';

const Formulario: React.FC = () => {
  const { profile } = useAuth();
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGroupData();
  }, [profile]);

  const fetchUserGroupData = async () => {
    try {
      setLoading(true);
      
      if (profile?.group_id) {
        console.log('Formulario: Fetching group data for user group:', profile.group_id);
        
        const { data: groupData, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', profile.group_id)
          .single();

        if (error) {
          console.error('Error fetching user group:', error);
        } else {
          const formattedGroup: Group = {
            id: groupData.id,
            name: groupData.name,
            powerBiUrl: groupData.power_bi_url || undefined,
            formUrl: groupData.form_url || undefined,
            createdAt: groupData.created_at
          };
          
          console.log('Formulario: User group data loaded:', formattedGroup);
          setUserGroup(formattedGroup);
        }
      } else {
        console.log('Formulario: User has no group assigned');
        setUserGroup(null);
      }
    } catch (error) {
      console.error('Error fetching user group data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Formulário de cadastro - {userGroup?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {userGroup ? (
              <>Grupo: <span className="font-semibold">{userGroup.name}</span> - Complete o formulário específico do seu grupo</>
            ) : (
              'Você não está vinculado a nenhum grupo. Entre em contato com o administrador.'
            )}
          </p>
        </div>

        {/* Form Section - Only show if user has group and group has form URL */}
        {userGroup && userGroup.formUrl ? (
          <div className="w-full">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <span>Formulário</span>
                </CardTitle>
                <CardDescription>
                  Formulário configurado especificamente para o seu grupo - {userGroup.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full bg-white rounded-lg overflow-hidden border">
                  <iframe
                    src={userGroup.formUrl}
                    width="100%"
                    height="800"
                    style={{ minHeight: '800px' }}
                    frameBorder="0"
                    allowFullScreen
                    title={`Formulário do Grupo - ${userGroup.name}`}
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : userGroup ? (
          // User has group but no form URL configured
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📝 Formulário não configurado
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    O grupo "{userGroup.name}" ainda não possui um formulário configurado. 
                    Entre em contato com o administrador para configurar o formulário.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // User has no group assigned
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🚫 Acesso Restrito
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Você não está vinculado a nenhum grupo. Entre em contato com o administrador 
                    para ser adicionado a um grupo e ter acesso aos formulários específicos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Explanatory Legend - Only show if user has access to form */}
        {userGroup && userGroup.formUrl && (
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    📝 Sobre este Formulário
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Este formulário foi desenvolvido para coletar informações estratégicas do seu grupo "{userGroup.name}". 
                    Através dele, você pode fornecer dados importantes sobre leads, performance e 
                    necessidades da sua área. As informações coletadas alimentam os dashboards e 
                    ajudam na tomada de decisões baseadas em dados. Complete todas as seções para 
                    garantir a precisão dos dados e relatórios gerados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Formulario;

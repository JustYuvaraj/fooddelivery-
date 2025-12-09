import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import deliveryService from '@/services/delivery.service';
import { DeliveryAssignmentDTO } from '@/types/api.types';
import Button from '@/components/common/Button';
import { toast } from 'react-hot-toast';

const AvailableTasksPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<DeliveryAssignmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await deliveryService.getAssignments('PENDING');
      setAssignments(data.content || data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setLoading(false);
    }
  };

  const handleAccept = async (orderId: number) => {
    try {
      await deliveryService.acceptDelivery(orderId);
      toast.success('Delivery accepted!');
      navigate('/delivery/active');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleReject = async (orderId: number, reason: string) => {
    try {
      await deliveryService.rejectDelivery(orderId, reason);
      toast.success('Delivery rejected');
      loadAssignments();
    } catch (error: any) {
      toast.error('Failed to reject delivery');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading available tasks...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Delivery Tasks</h1>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Order #{assignment.orderId}
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{assignment.status}</span>
                </p>
                {assignment.assignedAt && (
                  <p className="text-sm text-gray-600">
                    Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="primary"
                onClick={() => handleAccept(assignment.orderId)}
                className="flex-1"
              >
                Accept Delivery
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleReject(assignment.orderId, 'Not available')}
              >
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/delivery/deliveries/${assignment.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No available delivery tasks at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AvailableTasksPage;



